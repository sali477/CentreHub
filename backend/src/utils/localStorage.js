import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const UPLOAD_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../uploads');

export const getUploadRoot = () => UPLOAD_ROOT;

export const saveLocalFile = async (buffer, { folder, originalName = 'file' }) => {
  const ext = path.extname(originalName) || '';
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
  const dir = path.join(UPLOAD_ROOT, folder);

  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), buffer);

  return {
    url: `/uploads/${folder}/${filename}`,
    publicId: `local:${folder}/${filename}`,
  };
};

export const deleteLocalFile = async (publicId) => {
  if (!publicId?.startsWith('local:')) return;

  const relativePath = publicId.replace(/^local:/, '');
  const filePath = path.join(UPLOAD_ROOT, relativePath);

  try {
    await fs.unlink(filePath);
  } catch {
    // File may already be removed
  }
};
