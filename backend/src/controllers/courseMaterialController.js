const fs = require("fs/promises");
const path = require("path");

const Course = require("../models/Course");
const CourseMaterial = require("../models/CourseMaterial");

const {
  extractDocument,
} = require("../services/documentService");

async function uploadCourseMaterial(req, res) {
  let uploadedFilePath = "";

  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF or DOCX file.",
      });
    }

    uploadedFilePath = req.file.path;

    const course = await Course.findById(courseId);

    if (!course) {
      await fs.unlink(uploadedFilePath).catch(() => {});

      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    const extracted = await extractDocument(
      uploadedFilePath,
      req.file.originalname,
    );

    const material = await CourseMaterial.create({
      course: course._id,
      originalName: extracted.originalName,
      fileName: req.file.filename,
      mimeType: extracted.mimeType,
      fileSize: req.file.size,
      storageProvider: "local",
      storageKey: path.relative(
        path.join(__dirname, "../../uploads"),
        uploadedFilePath,
      ),
      storageUrl: "",
      status: "READY",
      extractedText: extracted.text,
      pageCount: extracted.pageCount,
      characterCount: extracted.characterCount,
      wordCount: extracted.wordCount,
      uploadedBy: req.user.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Course material uploaded and processed successfully.",
      material: {
        id: material._id.toString(),
        course: material.course.toString(),
        originalName: material.originalName,
        fileName: material.fileName,
        mimeType: material.mimeType,
        fileSize: material.fileSize,
        status: material.status,
        pageCount: material.pageCount,
        characterCount: material.characterCount,
        wordCount: material.wordCount,
        createdAt: material.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "Course material upload error:",
      error,
    );

    if (uploadedFilePath) {
      await fs.unlink(uploadedFilePath).catch(() => {});
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to process course material.",
    });
  }
}

module.exports = {
  uploadCourseMaterial,
};