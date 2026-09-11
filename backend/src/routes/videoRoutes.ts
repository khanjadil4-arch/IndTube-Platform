/**
 * Video upload routes — multipart/chunked upload to S3-compatible storage.
 *
 * Flow:
 *   1. POST /api/videos/initiate  — creates video record + S3 multipart upload, returns session
 *   2. POST /api/videos/:id/parts/:partNumber — returns presigned URL for that chunk
 *   3. POST /api/videos/:id/complete  — completes multipart upload, sets status=PROCESSING
 *   4. POST /api/videos/:id/abort    — aborts multipart upload, deletes video record
 *   5. GET  /api/videos/:id          — returns video metadata
 *   6. GET  /api/videos/:id/upload-status — returns upload session state for resume
 */

import { Router, type Response } from 'express';
import { authenticate, type AuthenticatedRequest } from '../middleware/authMiddleware.js';
import {
  getChannelByOwner,
  createVideoRecord,
  updateVideoStatus,
  setVideoUrl,
  getVideoById,
  getVideoWithChannel,
  generateStorageKey,
  generateVideoId,
} from '../services/videoService.js';
import {
  initiateMultipartUpload,
  getPresignedPartUrl,
  completeMultipartUpload,
  abortMultipartUpload,
  buildStoragePublicUrl,
  StorageConfigError,
} from '../services/storageService.js';
import {
  createUploadSession,
  getUploadSession,
  getUploadSessionByVideo,
  updateUploadedParts,
  completeUploadSession,
  abortUploadSession,
} from '../services/uploadService.js';

const router = Router();

router.use(authenticate);

const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1 GB
const CHUNK_SIZE = 8 * 1024 * 1024; // 8 MB per part
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_EXTENSIONS: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
};

// POST /api/videos/initiate
router.post('/initiate', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, visibility, contentType, fileSize, categoryId } = req.body;
    const userId = req.user!.sub;

    if (!title || title.trim().length === 0) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }
    if (!contentType || !ALLOWED_TYPES.includes(contentType)) {
      res.status(400).json({ error: 'Unsupported file type. Use MP4, WebM, or MOV.' });
      return;
    }
    if (!fileSize || fileSize > MAX_FILE_SIZE) {
      res.status(413).json({ error: 'File too large. Maximum size is 1 GB.' });
      return;
    }
    if (fileSize < 1) {
      res.status(400).json({ error: 'Invalid file size' });
      return;
    }

    const validVisibilities = ['PUBLIC', 'UNLISTED', 'PRIVATE'];
    const vis = validVisibilities.includes(visibility) ? visibility : 'PUBLIC';

    const channel = await getChannelByOwner(userId);
    if (!channel) {
      res.status(403).json({ error: 'You do not have a channel. Create a channel first.' });
      return;
    }

    const videoId = generateVideoId();
    const extension = ALLOWED_EXTENSIONS[contentType];
    const storageKey = generateStorageKey(videoId, extension);

    const s3UploadId = await initiateMultipartUpload(storageKey, contentType);

    const totalParts = Math.ceil(fileSize / CHUNK_SIZE);

    const session = await createUploadSession({
      videoId,
      channelId: channel.id,
      storageKey,
      s3UploadId,
      fileSize,
      chunkSize: CHUNK_SIZE,
      totalParts,
    });

    const video = await createVideoRecord({
      channelId: channel.id,
      categoryId: categoryId || null,
      title: title.trim(),
      description: description?.trim() || '',
      visibility: vis,
      storageKey,
    });

    res.status(201).json({
      videoId: video.id,
      sessionId: session.id,
      storageKey,
      uploadId: s3UploadId,
      chunkSize: CHUNK_SIZE,
      totalParts,
      fileSize,
    });
  } catch (err) {
    if (err instanceof StorageConfigError) {
      res.status(503).json({ error: err.message });
      return;
    }
    console.error('Initiate upload error:', err);
    res.status(500).json({ error: 'Failed to initiate upload' });
  }
});

// POST /api/videos/:id/parts/:partNumber
router.post('/:id/parts/:partNumber', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id: videoId, partNumber } = req.params;
    const partNum = parseInt(partNumber, 10);

    if (isNaN(partNum) || partNum < 1 || partNum > 10000) {
      res.status(400).json({ error: 'Invalid part number' });
      return;
    }

    const videoWithChannel = await getVideoWithChannel(videoId);
    if (!videoWithChannel) {
      res.status(404).json({ error: 'Video not found' });
      return;
    }
    if (videoWithChannel.ownerId !== req.user!.sub) {
      res.status(403).json({ error: 'You do not own this video' });
      return;
    }

    const session = await getUploadSessionByVideo(videoId);
    if (!session) {
      res.status(404).json({ error: 'No active upload session for this video' });
      return;
    }

    const url = await getPresignedPartUrl(
      session.storage_key,
      session.s3_upload_id,
      partNum,
    );

    res.json({ url, partNumber: partNum });
  } catch (err) {
    if (err instanceof StorageConfigError) {
      res.status(503).json({ error: err.message });
      return;
    }
    console.error('Get part URL error:', err);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

// POST /api/videos/:id/complete
router.post('/:id/complete', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id: videoId } = req.params;
    const { parts } = req.body as { parts: { PartNumber: number; ETag: string }[] };

    if (!parts || !Array.isArray(parts) || parts.length === 0) {
      res.status(400).json({ error: 'Parts array is required' });
      return;
    }

    const videoWithChannel = await getVideoWithChannel(videoId);
    if (!videoWithChannel) {
      res.status(404).json({ error: 'Video not found' });
      return;
    }
    if (videoWithChannel.ownerId !== req.user!.sub) {
      res.status(403).json({ error: 'You do not own this video' });
      return;
    }

    const session = await getUploadSessionByVideo(videoId);
    if (!session) {
      res.status(404).json({ error: 'No active upload session for this video' });
      return;
    }

    await completeMultipartUpload(session.storage_key, session.s3_upload_id, parts);

    const publicUrl = buildStoragePublicUrl(session.storage_key);
    await setVideoUrl(videoId, publicUrl);
    await updateVideoStatus(videoId, 'PROCESSING');
    await completeUploadSession(session.id);

    res.json({ videoId, status: 'PROCESSING' });
  } catch (err) {
    if (err instanceof StorageConfigError) {
      res.status(503).json({ error: err.message });
      return;
    }
    console.error('Complete upload error:', err);
    res.status(500).json({ error: 'Failed to complete upload' });
  }
});

// POST /api/videos/:id/abort
router.post('/:id/abort', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id: videoId } = req.params;

    const videoWithChannel = await getVideoWithChannel(videoId);
    if (!videoWithChannel) {
      res.status(404).json({ error: 'Video not found' });
      return;
    }
    if (videoWithChannel.ownerId !== req.user!.sub) {
      res.status(403).json({ error: 'You do not own this video' });
      return;
    }

    const session = await getUploadSessionByVideo(videoId);
    if (session) {
      await abortMultipartUpload(session.storage_key, session.s3_upload_id);
      await abortUploadSession(session.id);
    }

    await updateVideoStatus(videoId, 'FAILED');

    res.json({ videoId, status: 'aborted' });
  } catch (err) {
    if (err instanceof StorageConfigError) {
      res.status(503).json({ error: err.message });
      return;
    }
    console.error('Abort upload error:', err);
    res.status(500).json({ error: 'Failed to abort upload' });
  }
});

// GET /api/videos/:id/upload-status
router.get('/:id/upload-status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id: videoId } = req.params;

    const videoWithChannel = await getVideoWithChannel(videoId);
    if (!videoWithChannel) {
      res.status(404).json({ error: 'Video not found' });
      return;
    }
    if (videoWithChannel.ownerId !== req.user!.sub) {
      res.status(403).json({ error: 'You do not own this video' });
      return;
    }

    const session = await getUploadSessionByVideo(videoId);
    if (!session) {
      res.status(404).json({ error: 'No active upload session' });
      return;
    }

    res.json({
      sessionId: session.id,
      videoId,
      uploadedParts: session.uploaded_parts,
      totalParts: session.total_parts,
      chunkSize: session.chunk_size,
      fileSize: session.file_size,
      status: session.status,
    });
  } catch (err) {
    console.error('Upload status error:', err);
    res.status(500).json({ error: 'Failed to get upload status' });
  }
});

// GET /api/videos/:id
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const video = await getVideoById(req.params.id);
    if (!video) {
      res.status(404).json({ error: 'Video not found' });
      return;
    }
    res.json({ video });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
