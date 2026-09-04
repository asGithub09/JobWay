const cloudinary = require("cloudinary").v2;

const isCloudinaryConfigured =
  Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(process.env.CLOUDINARY_API_KEY) &&
  Boolean(process.env.CLOUDINARY_API_SECRET);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

function ensureCloudinaryConfigured() {
  if (!isCloudinaryConfigured) {
    throw new Error(
      "Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }
}

async function uploadCourseBanner(filePath, options = {}) {
  ensureCloudinaryConfigured();

  const result = await cloudinary.uploader.upload(filePath, {
    folder: options.folder || "jobway/course-banners",
    resource_type: "image",
    use_filename: true,
    unique_filename: true,
    overwrite: false,
    type: "upload",
  });

  return {
    publicId: result.public_id,
    secureUrl: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

async function deleteCloudinaryAsset(publicId) {
  ensureCloudinaryConfigured();

  if (!publicId) {
    return null;
  }

  return cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    type: "upload",
  });
}

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  ensureCloudinaryConfigured,
  uploadCourseBanner,
  deleteCloudinaryAsset,
};