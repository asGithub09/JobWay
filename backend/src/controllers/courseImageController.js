const fs = require("fs/promises");
const path = require("path");

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

const protocol =
  req.headers["x-forwarded-proto"] ||
  req.protocol;

const host = req.get("host");

const imageUrl =
  `${protocol}://${host}/uploads/course-banners/${req.file.filename}`;
    return res.status(201).json({
      success: true,
      message: "Course banner uploaded successfully.",
      imageUrl,
      file: {
        originalName: req.file.originalname,
        fileName: req.file.filename,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
      },
    });
  } catch (error) {
    console.error("Course image upload error:", error);

    if (uploadedFilePath) {
      await fs.unlink(uploadedFilePath).catch(() => {});
    }

    return res.status(500).json({
      success: false,
      message:
        error.message || "Unable to upload course banner image.",
    });
  }
}

module.exports = {
  uploadCourseImage,
};