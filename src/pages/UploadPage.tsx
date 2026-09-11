import { useState, useRef, useCallback } from 'react';
import { UploadCloud, Film, X, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { categories } from '@/data/mockData';
import { config } from '@/lib/config';
import { useAuth } from '@/context/AuthContext';
import {
  initiateUpload,
  uploadChunkWithRetry,
  completeUpload,
  abortUpload,
  type PartUploadResult,
} from '@/services/uploadService';

const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1 GB
const CHUNK_SIZE = 8 * 1024 * 1024; // 8 MB — must match backend
const ACCEPTED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ACCEPTED_EXTENSIONS = ['.mp4', '.webm', '.mov'];

type UploadState = 'idle' | 'uploading' | 'completed' | 'failed';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function UploadPage() {
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState<'select' | 'details' | 'uploading' | 'result'>('select');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('tech');
  const [visibility, setVisibility] = useState('public');
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [videoId, setVideoId] = useState('');
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef(false);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type) && !ACCEPTED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext))) {
      setError('Unsupported file type. Please use MP4, WebM, or MOV.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`File is too large (${formatFileSize(file.size)}). Maximum size is 1 GB.`);
      return;
    }

    setError('');
    setVideoFile(file);
    setStep('details');
  };

  const handleThumbSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setThumbnailFile(file);
  };

  const resetState = () => {
    setStep('select');
    setVideoFile(null);
    setThumbnailFile(null);
    setTitle('');
    setDescription('');
    setUploadState('idle');
    setProgress(0);
    setError('');
    setVideoId('');
    abortRef.current = false;
  };

  const handleUpload = useCallback(async () => {
    if (!videoFile) return;
    setStep('uploading');
    setUploadState('uploading');
    setProgress(0);
    setError('');
    abortRef.current = false;

    try {
      const initRes = await initiateUpload({
        title,
        description,
        visibility: visibility.toUpperCase(),
        contentType: videoFile.type || 'video/mp4',
        fileSize: videoFile.size,
        categoryId: category,
      });

      setVideoId(initRes.videoId);

      const totalParts = initRes.totalParts;
      const parts: PartUploadResult[] = [];
      let uploadedBytes = 0;

      for (let partNum = 1; partNum <= totalParts; partNum++) {
        if (abortRef.current) break;

        const start = (partNum - 1) * initRes.chunkSize;
        const end = Math.min(start + initRes.chunkSize, videoFile.size);
        const chunk = videoFile.slice(start, end);

        const result = await uploadChunkWithRetry(
          initRes.videoId,
          partNum,
          chunk,
          (loaded) => {
            const currentBytes = uploadedBytes + loaded;
            const pct = Math.min(99, Math.round((currentBytes / videoFile.size) * 100));
            setProgress(pct);
          },
        );

        parts.push(result);
        uploadedBytes = end;
        setProgress(Math.min(99, Math.round((uploadedBytes / videoFile.size) * 100)));
      }

      if (abortRef.current) {
        await abortUpload(initRes.videoId);
        setUploadState('failed');
        setError('Upload was cancelled.');
        return;
      }

      await completeUpload(initRes.videoId, parts);
      setProgress(100);
      setUploadState('completed');
      setStep('result');
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadState('failed');
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
      if (videoId) {
        try {
          await abortUpload(videoId);
        } catch {
          // ignore abort errors
        }
      }
    }
  }, [videoFile, title, description, visibility, category, videoId]);

  const handleCancelUpload = () => {
    abortRef.current = true;
  };

  const isRealUpload = !!config.apiBaseUrl && isAuthenticated;

  return (
    <div className="px-3 sm:px-4 py-4 max-w-3xl mx-auto">
      <h1 className="text-lg font-bold mb-4">Upload video</h1>

      {error && (
        <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-error-950/50 border border-error-900 text-error-300 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {step === 'select' && (
        <div
          onClick={() => videoInputRef.current?.click()}
          className="border-2 border-dashed border-ink-700 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-brand-600 hover:bg-ink-900/50 transition-all"
        >
          <div className="w-16 h-16 rounded-full bg-ink-800 flex items-center justify-center mb-4">
            <UploadCloud className="w-8 h-8 text-brand-500" />
          </div>
          <p className="font-semibold text-sm">Select a video file to upload</p>
          <p className="text-xs text-ink-500 mt-1">MP4, WebM, or MOV — max 1 GB</p>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoSelect}
            className="hidden"
          />
        </div>
      )}

      {step === 'details' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isRealUpload) {
              handleUpload();
            } else {
              setError('Backend is not configured. Set VITE_API_BASE_URL and sign in to upload.');
            }
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center gap-3 p-3 card-surface">
            <Film className="w-5 h-5 text-brand-500 shrink-0" />
            <div className="text-sm font-medium truncate flex-1 min-w-0">
              <div className="truncate">{videoFile?.name}</div>
              <div className="text-xs text-ink-500">{videoFile && formatFileSize(videoFile.size)}</div>
            </div>
            <button
              type="button"
              onClick={resetState}
              className="p-1 rounded hover:bg-ink-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="text-sm font-semibold mb-1.5 block">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a title..."
              maxLength={100}
              required
              className="w-full bg-ink-900 border border-ink-800 rounded-lg px-3 py-2.5 text-sm placeholder:text-ink-500 focus:outline-none focus:border-brand-600 transition-colors"
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-1.5 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell viewers about your video..."
              rows={4}
              className="w-full bg-ink-900 border border-ink-800 rounded-lg px-3 py-2.5 text-sm placeholder:text-ink-500 focus:outline-none focus:border-brand-600 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-1.5 block">Thumbnail</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => thumbInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-ink-900 border border-ink-800 rounded-lg text-sm hover:bg-ink-800 transition-colors"
              >
                <ImageIcon className="w-4 h-4" />
                Upload thumbnail
              </button>
              {thumbnailFile && (
                <span className="text-sm text-ink-300 truncate">{thumbnailFile.name}</span>
              )}
              <input
                ref={thumbInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbSelect}
                className="hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold mb-1.5 block">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-ink-900 border border-ink-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-600 transition-colors"
            >
              {categories
                .filter((c) => c.id !== 'all')
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold mb-1.5 block">Visibility</label>
            <div className="flex gap-2">
              {['public', 'unlisted', 'private'].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVisibility(v)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    visibility === v
                      ? 'bg-brand-600 text-white'
                      : 'bg-ink-900 text-ink-300 hover:bg-ink-800'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={resetState}
              className="px-4 py-2.5 text-sm font-medium text-ink-400 hover:text-ink-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-semibold bg-brand-600 text-white rounded-lg hover:bg-brand-500 transition-colors"
            >
              Upload
            </button>
          </div>
        </form>
      )}

      {step === 'uploading' && (
        <div className="flex flex-col gap-6 py-8">
          <div className="flex items-center gap-3 p-3 card-surface">
            <Film className="w-5 h-5 text-brand-500 shrink-0" />
            <div className="text-sm font-medium truncate flex-1 min-w-0">
              <div className="truncate">{videoFile?.name}</div>
              <div className="text-xs text-ink-500">{videoFile && formatFileSize(videoFile.size)}</div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-ink-800"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                  className="text-brand-500 transition-all duration-300"
                  strokeDasharray={`${2 * Math.PI * 44}`}
                  strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold">{progress}%</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm font-semibold flex items-center gap-2 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
                {uploadState === 'uploading' ? 'Uploading...' : 'Processing...'}
              </p>
              <p className="text-xs text-ink-500 mt-1">
                Do not close this page while uploading
              </p>
            </div>

            <button
              onClick={handleCancelUpload}
              className="px-4 py-2 text-sm font-medium text-error-400 hover:text-error-300 transition-colors"
            >
              Cancel upload
            </button>
          </div>
        </div>
      )}

      {step === 'result' && (
        <div className="flex flex-col items-center gap-4 py-12">
          {uploadState === 'completed' && (
            <>
              <div className="w-16 h-16 rounded-full bg-success-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-success-400" />
              </div>
              <h2 className="text-lg font-bold">Upload complete</h2>
              <p className="text-sm text-ink-400 text-center max-w-sm">
                Your video has been uploaded and is now processing. It will be available
                once processing is complete.
              </p>
              <button
                onClick={resetState}
                className="mt-2 px-6 py-2.5 text-sm font-semibold bg-brand-600 text-white rounded-lg hover:bg-brand-500 transition-colors"
              >
                Upload another video
              </button>
            </>
          )}
          {uploadState === 'failed' && (
            <>
              <div className="w-16 h-16 rounded-full bg-error-500/20 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-error-400" />
              </div>
              <h2 className="text-lg font-bold">Upload failed</h2>
              <p className="text-sm text-ink-400 text-center max-w-sm">{error}</p>
              <button
                onClick={resetState}
                className="mt-2 px-6 py-2.5 text-sm font-semibold bg-brand-600 text-white rounded-lg hover:bg-brand-500 transition-colors"
              >
                Try again
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
