const fs = require("fs/promises");
const fsSync = require("fs");
const path = require("path");

const Course = require("../models/Course");
const CourseMaterial = require("../models/CourseMaterial");

const {
  extractDocument,
} = require("../services/documentService");

function serializeMaterial(material, course) {
  return {
    id: material._id.toString(),
    course: course
      ? {
          id: course._id.toString(),
          title: course.title,
          slug: course.slug,
          category: course.category,
        }
      : material.course?.toString() || "",
    originalName: material.originalName,
    fileName: material.fileName,
    mimeType: material.mimeType,
    fileSize: material.fileSize,
    storageProvider: material.storageProvider,
    storageKey: material.storageKey,
    storageUrl: material.storageUrl,
    status: material.status,
    pageCount: material.pageCount,
    characterCount: material.characterCount,
    wordCount: material.wordCount,
    errorMessage: material.errorMessage,
    createdAt: material.createdAt,
    updatedAt: material.updatedAt,
  };
}

function getMaterialAbsolutePath(material) {
  if (
    material.storageProvider !== "local" ||
    !material.storageKey
  ) {
    return "";
  }

  const uploadsRoot = path.resolve(
    __dirname,
    "../../uploads",
  );

  const absolutePath = path.resolve(
    uploadsRoot,
    material.storageKey,
  );

  if (
    absolutePath !== uploadsRoot &&
    !absolutePath.startsWith(`${uploadsRoot}${path.sep}`)
  ) {
    return "";
  }

  return absolutePath;
}

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
      message:
        "Course material uploaded and processed successfully.",
      material: serializeMaterial(material, course),
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

async function getAdminCourseMaterials(req, res) {
  try {
    const { courseId, status } = req.query;

    const filter = {};

    if (courseId) {
      filter.course = courseId;
    }

    if (status) {
      filter.status = status;
    }

    const materials = await CourseMaterial.find(filter)
      .populate(
        "course",
        "title slug category isPublished",
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      materials: materials.map((material) =>
        serializeMaterial(
          material,
          material.course,
        ),
      ),
    });
  } catch (error) {
    console.error(
      "Get admin course materials error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load course materials.",
    });
  }
}

async function getCourseMaterials(req, res) {
  try {
    const { courseId } = req.query;

    const filter = {
      status: "READY",
    };

    if (courseId) {
      filter.course = courseId;
    }

    const materials = await CourseMaterial.find(filter)
      .populate(
        "course",
        "title slug category isPublished",
      )
      .sort({ createdAt: -1 })
      .lean();

    const visibleMaterials = materials.filter(
      (material) =>
        material.course &&
        material.course.isPublished === true,
    );

    return res.json({
      success: true,
      materials: visibleMaterials.map(
        (material) =>
          serializeMaterial(
            material,
            material.course,
          ),
      ),
    });
  } catch (error) {
    console.error(
      "Get course materials error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load study resources.",
    });
  }
}

async function getCourseMaterial(req, res) {
  try {
    const { id } = req.params;

    const material =
      await CourseMaterial.findById(id).populate(
        "course",
        "title slug category isPublished",
      );

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Resource not found.",
      });
    }

    const isAdmin =
      req.user?.role === "admin";

    if (
      !isAdmin &&
      (!material.course ||
        material.course.isPublished !== true ||
        material.status !== "READY")
    ) {
      return res.status(404).json({
        success: false,
        message: "Resource not found.",
      });
    }

    return res.json({
      success: true,
      material: serializeMaterial(
        material,
        material.course,
      ),
    });
  } catch (error) {
    console.error(
      "Get course material error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load resource.",
    });
  }
}

async function openCourseMaterial(req, res) {
  try {
    const { id } = req.params;

    const material =
      await CourseMaterial.findById(id).populate(
        "course",
        "title slug category isPublished",
      );

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Resource not found.",
      });
    }

    const isAdmin =
      req.user?.role === "admin";

    if (
      !isAdmin &&
      (!material.course ||
        material.course.isPublished !== true ||
        material.status !== "READY")
    ) {
      return res.status(404).json({
        success: false,
        message: "Resource not found.",
      });
    }

    if (material.storageProvider === "cloudinary") {
      if (!material.storageUrl) {
        return res.status(404).json({
          success: false,
          message: "Resource file is unavailable.",
        });
      }

      return res.redirect(material.storageUrl);
    }

    if (material.storageProvider !== "local") {
      return res.status(501).json({
        success: false,
        message:
          "This resource storage provider is not configured.",
      });
    }

    const absolutePath =
      getMaterialAbsolutePath(material);

    if (
      !absolutePath ||
      !fsSync.existsSync(absolutePath)
    ) {
      return res.status(404).json({
        success: false,
        message: "Resource file is unavailable.",
      });
    }

    res.setHeader(
      "Content-Type",
      material.mimeType ||
        "application/octet-stream",
    );

    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(
        material.originalName,
      )}"`,
    );

    return res.sendFile(absolutePath);
  } catch (error) {
    console.error(
      "Open course material error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to open resource.",
    });
  }
}

async function downloadCourseMaterial(req, res) {
  try {
    const { id } = req.params;

    const material =
      await CourseMaterial.findById(id).populate(
        "course",
        "title slug category isPublished",
      );

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Resource not found.",
      });
    }

    const isAdmin =
      req.user?.role === "admin";

    if (
      !isAdmin &&
      (!material.course ||
        material.course.isPublished !== true ||
        material.status !== "READY")
    ) {
      return res.status(404).json({
        success: false,
        message: "Resource not found.",
      });
    }

    if (material.storageProvider === "cloudinary") {
      if (!material.storageUrl) {
        return res.status(404).json({
          success: false,
          message: "Resource file is unavailable.",
        });
      }

      return res.redirect(material.storageUrl);
    }

    if (material.storageProvider !== "local") {
      return res.status(501).json({
        success: false,
        message:
          "This resource storage provider is not configured.",
      });
    }

    const absolutePath =
      getMaterialAbsolutePath(material);

    if (
      !absolutePath ||
      !fsSync.existsSync(absolutePath)
    ) {
      return res.status(404).json({
        success: false,
        message: "Resource file is unavailable.",
      });
    }

    return res.download(
      absolutePath,
      material.originalName,
    );
  } catch (error) {
    console.error(
      "Download course material error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to download resource.",
    });
  }
}

async function deleteCourseMaterial(req, res) {
  try {
    const { id } = req.params;

    const material =
      await CourseMaterial.findById(id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Resource not found.",
      });
    }

    const absolutePath =
      getMaterialAbsolutePath(material);

    await CourseMaterial.findByIdAndDelete(id);

    if (absolutePath) {
      await fs.unlink(absolutePath).catch(() => {});
    }

    return res.json({
      success: true,
      message: "Course material deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete course material error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete resource.",
    });
  }
}

module.exports = {
  uploadCourseMaterial,
  getAdminCourseMaterials,
  getCourseMaterials,
  getCourseMaterial,
  openCourseMaterial,
  downloadCourseMaterial,
  deleteCourseMaterial,
};