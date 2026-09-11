/**
 * S3-compatible storage service.
 *
 * Uses the AWS SDK v3 modular clients to work with any S3-compatible storage
 * (MinIO, Cloudflare R2, Backblaze B2, Wasabi, AWS S3, etc.). No vendor lock-in.
 *
 * Generates presigned URLs for multipart upload so the browser uploads directly
 * to storage — the backend never proxies file content and never exposes secret
 * keys to the frontend.
 */

import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config/index.js';

export class StorageConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageConfigError';
  }
}

export function validateStorageConfig(): void {
  const missing: string[] = [];
  if (!config.storageEndpoint) missing.push('STORAGE_ENDPOINT');
  if (!config.storageBucket) missing.push('STORAGE_BUCKET');
  if (!config.storageAccessKey) missing.push('STORAGE_ACCESS_KEY');
  if (!config.storageSecretKey) missing.push('STORAGE_SECRET_KEY');
  if (!config.storagePublicUrl) missing.push('STORAGE_PUBLIC_URL');
  if (missing.length > 0) {
    throw new StorageConfigError(
      `Storage is not configured. Missing: ${missing.join(', ')}. Set these in your .env file.`,
    );
  }
}

function createS3Client(): S3Client {
  validateStorageConfig();
  return new S3Client({
    endpoint: config.storageEndpoint || undefined,
    region: config.storageRegion,
    credentials: {
      accessKeyId: config.storageAccessKey,
      secretAccessKey: config.storageSecretKey,
    },
    forcePathStyle: true,
  });
}

let client: S3Client | null = null;
function getS3(): S3Client {
  if (!client) client = createS3Client();
  return client;
}

export async function initiateMultipartUpload(
  storageKey: string,
  contentType: string,
): Promise<string> {
  const s3 = getS3();
  const command = new CreateMultipartUploadCommand({
    Bucket: config.storageBucket,
    Key: storageKey,
    ContentType: contentType,
  });
  const response = await s3.send(command);
  if (!response.UploadId) {
    throw new Error('Failed to initiate multipart upload');
  }
  return response.UploadId;
}

export async function getPresignedPartUrl(
  storageKey: string,
  uploadId: string,
  partNumber: number,
): Promise<string> {
  const s3 = getS3();
  const command = new UploadPartCommand({
    Bucket: config.storageBucket,
    Key: storageKey,
    UploadId: uploadId,
    PartNumber: partNumber,
  });
  return getSignedUrl(s3, command, { expiresIn: 3600 });
}

export async function completeMultipartUpload(
  storageKey: string,
  uploadId: string,
  parts: { PartNumber: number; ETag: string }[],
): Promise<string | undefined> {
  const s3 = getS3();
  const command = new CompleteMultipartUploadCommand({
    Bucket: config.storageBucket,
    Key: storageKey,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: parts.sort((a, b) => a.PartNumber - b.PartNumber),
    },
  });
  const response = await s3.send(command);
  return response.Location;
}

export async function abortMultipartUpload(
  storageKey: string,
  uploadId: string,
): Promise<void> {
  const s3 = getS3();
  const command = new AbortMultipartUploadCommand({
    Bucket: config.storageBucket,
    Key: storageKey,
    UploadId: uploadId,
  });
  await s3.send(command);
}

export async function headObject(storageKey: string): Promise<boolean> {
  try {
    const s3 = getS3();
    const command = new HeadObjectCommand({
      Bucket: config.storageBucket,
      Key: storageKey,
    });
    await s3.send(command);
    return true;
  } catch {
    return false;
  }
}

export function buildStoragePublicUrl(storageKey: string): string {
  const base = config.storagePublicUrl || config.storageEndpoint || '';
  return `${base.replace(/\/$/, '')}/${storageKey}`;
}
