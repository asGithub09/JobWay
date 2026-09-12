const fs = require("fs/promises");

const {
  uploadEducatorCourseMedia: uploadCloudinaryMedia,
} = require("../services/cloudinaryService");

async function uploadEducatorCourseMedia(
  req,
  res,
) {
  let uploadedFilePath = "";

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image or video file.",
      });
    }

    const mediaType = String(
      req.body?.type || "",
    ).toUpperCase();

    if (
      mediaType !== "IMAGE" &&
      mediaType !== "VIDEO"
    ) {
      return res.status(400).json({
        success: false,
        message: "Media type must be IMAGE or VIDEO.",
      });
    }

    uploadedFilePath = req.file.path;

    const uploadedMedia =
      await uploadCloudinaryMedia(
        uploadedFilePath,
        {
          resourceType:
            mediaType === "VIDEO"
              ? "video"
              : "image",
          folder:
            mediaType === "VIDEO"
              ? "jobway/educator-course-videos"
              : "jobway/educator-course-images",
        },
      );

    return res.status(201).json({
      success: true,
      message:
        mediaType === "VIDEO"
          ? "Course video uploaded successfully."
          : "Course image uploaded successfully.",
      type: mediaType,
      url: uploadedMedia.secureUrl,
      publicId: uploadedMedia.publicId,
      file: {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        resourceType:
          uploadedMedia.resourceType,
        format: uploadedMedia.format,
        width: uploadedMedia.width,
        height: uploadedMedia.height,
        duration: uploadedMedia.duration,
      },
    });
  } catch (error) {
    console.error(
      "Educator course media upload error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to upload course media.",
    });
  } finally {
    if (uploadedFilePath) {
      await fs
        .unlink(uploadedFilePath)
        .catch(() => {});
    }
  }
}

module.exports = {
  uploadEducatorCourseMedia,
};
