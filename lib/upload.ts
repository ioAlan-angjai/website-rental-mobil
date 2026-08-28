import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

/**
 * Ensures target upload directory exists within public/uploads
 */
async function ensureUploadDir(subfolder: string): Promise<string> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', subfolder);
  await mkdir(uploadDir, { recursive: true });
  return uploadDir;
}

/**
 * Saves a File/Blob to physical disk in public/uploads/${subfolder}
 * Returns the public relative web URL (e.g. /uploads/documents/xyz.jpg)
 */
export async function saveUploadedFile(
  file: File | Blob,
  subfolder: string = 'general',
  originalName?: string
): Promise<string> {
  const uploadDir = await ensureUploadDir(subfolder);
  const mimeType = file.type || 'image/jpeg';
  const ext = ALLOWED_MIME_TYPES[mimeType] || path.extname(originalName || '') || '.jpg';

  const randomHash = crypto.randomBytes(8).toString('hex');
  const safeName = `${Date.now()}-${randomHash}${ext}`;
  const filePath = path.join(uploadDir, safeName);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await writeFile(filePath, buffer);

  return `/uploads/${subfolder}/${safeName}`;
}

/**
 * If input is a Base64 data URL (e.g. "data:image/png;base64,..."),
 * extracts buffer, saves to disk, and returns the public web URL.
 * If input is already an HTTP URL or relative path, returns it as-is.
 */
export async function saveBase64Image(
  dataUrlOrPath: string | null | undefined,
  subfolder: string = 'general'
): Promise<string | null> {
  if (!dataUrlOrPath) return null;

  // Already a file URL or path
  if (!dataUrlOrPath.startsWith('data:image/')) {
    return dataUrlOrPath;
  }

  try {
    const uploadDir = await ensureUploadDir(subfolder);

    // Extract mime type and base64 payload
    const matches = dataUrlOrPath.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return dataUrlOrPath;
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const ext = ALLOWED_MIME_TYPES[mimeType] || '.jpg';

    const randomHash = crypto.randomBytes(8).toString('hex');
    const safeName = `${Date.now()}-${randomHash}${ext}`;
    const filePath = path.join(uploadDir, safeName);

    const buffer = Buffer.from(base64Data, 'base64');
    await writeFile(filePath, buffer);

    return `/uploads/${subfolder}/${safeName}`;
  } catch (error) {
    console.error('Error saving base64 image to disk:', error);
    return dataUrlOrPath; // fallback
  }
}
