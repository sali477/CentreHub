import { uploadToCloudinary, deleteFromCloudinary } from '../middleware/upload.js';
import { saveLocalFile, deleteLocalFile } from './localStorage.js';

const isPlaceholder = (value) => {
  const v = value?.trim();
  return !v || v.startsWith('your_');
};

export const isCloudinaryConfigured = () =>
  !isPlaceholder(process.env.CLOUDINARY_CLOUD_NAME) &&
  !isPlaceholder(process.env.CLOUDINARY_API_KEY) &&
  !isPlaceholder(process.env.CLOUDINARY_API_SECRET);

const cloudinaryFolderMap = {
  images: 'images',
  videos: 'videos',
  pdfs: 'pdfs',
};

const cloudinaryResourceMap = {
  images: 'image',
  videos: 'video',
  pdfs: 'raw',
};

export const storeUploadedFile = async (file, folder) => {
  if (isCloudinaryConfigured()) {
    const result = await uploadToCloudinary(file.buffer, {
      folder: `centrehub/${cloudinaryFolderMap[folder]}`,
      resource_type: cloudinaryResourceMap[folder],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration || 0,
      storage: 'cloudinary',
    };
  }

  const saved = await saveLocalFile(file.buffer, {
    folder: cloudinaryFolderMap[folder],
    originalName: file.originalname,
  });

  return {
    url: saved.url,
    publicId: saved.publicId,
    duration: 0,
    storage: 'local',
  };
};

export const removeStoredFile = async (publicId, resourceType = 'image') => {
  if (!publicId) return;

  if (publicId.startsWith('local:')) {
    await deleteLocalFile(publicId);
    return;
  }

  if (isCloudinaryConfigured()) {
    await deleteFromCloudinary(publicId, resourceType);
  }
};
