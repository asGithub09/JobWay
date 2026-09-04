const fs = require("fs/promises");

const {
  uploadCourseBanner,
  deleteCloudinaryAsset,
} = require("../services/cloudinaryService");

async function uploadCourseImage(req, res) {
  let uploadedFilePath = "";

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a course banner image.",
      });
    }

    uploadedFilePath = req.file.path;

    const uploadedImage = await uploadCourseBanner(
      uploadedFilePath,
      {
        folder: "jobway/course-banners",
      },
    );

    return res.status(201).json({
      success: true,
      message: "Course banner uploaded successfully.",
      imageUrl: uploadedImage.secureUrl,
      publicId: uploadedImage.publicId,
      file: {
        originalName: req.file.originalname,
        fileName: req.file.filename,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        width: uploadedImage.width,
        height: uploadedImage.height,
        format: uploadedImage.format,
      },
    });
  } catch (error) {
    console.error("Course image upload error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to upload course banner image.",
    });
  } finally {
    if (uploadedFilePath) {
      await fs.unlink(uploadedFilePath).catch(() => {});
    }
  }
}

async function deleteCourseImage(req, res) {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: "Cloudinary public ID is required.",
      });
    }

    await deleteCloudinaryAsset(publicId);

    return res.status(200).json({
      success: true,
      message: "Course banner deleted successfully.",
    });
  } catch (error) {
    console.error("Course image delete error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to delete course banner image.",
    });
  }
}

module.exports = {
  uploadCourseImage,
  deleteCourseImage,
};