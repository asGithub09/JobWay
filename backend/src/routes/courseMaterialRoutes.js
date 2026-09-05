const express = require("express");
const multer = require("multer");
const path = require("path");

const {
  authenticateToken,
  authorizeAdmin,
} = require("../middleware/authMiddleware");

const {
  uploadCourseMaterial,
  getAdminCourseMaterials,
  getCourseMaterials,
  getCourseMaterial,
  openCourseMaterial,
  downloadCourseMaterial,
  deleteCourseMaterial,
} = require("../controllers/courseMaterialController");

const router = express.Router();

const uploadDirectory = path.join(
  __dirname,
  "../../uploads/course-materials",
);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (_req, file, cb) => {
    const extension = path.extname(
      file.originalname,
    );

    const baseName = path
      .basename(
        file.originalname,
        extension,
      )
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80);

    cb(
      null,
      `${Date.now()}-${baseName || "material"}${extension.toLowerCase()}`,
    );
  },
});

const fileFilter = (_req, file, cb) => {
  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  const allowedExtensions = [
    ".pdf",
    ".docx",
  ];

  const allowedMimeTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (
    allowedExtensions.includes(extension) &&
    allowedMimeTypes.includes(file.mimetype)
  ) {
    cb(null, true);
    return;
  }

  cb(
    new Error(
      "Only PDF and DOCX files are allowed.",
    ),
  );
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
});

router.get(
  "/",
  authenticateToken,
  getCourseMaterials,
);

router.get(
  "/admin/all",
  authenticateToken,
  authorizeAdmin,
  getAdminCourseMaterials,
);

router.post(
  "/upload",
  authenticateToken,
  authorizeAdmin,
  upload.single("file"),
  uploadCourseMaterial,
);

router.get(
  "/:id",
  authenticateToken,
  getCourseMaterial,
);

router.get(
  "/:id/open",
  authenticateToken,
  openCourseMaterial,
);

router.get(
  "/:id/download",
  authenticateToken,
  downloadCourseMaterial,
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeAdmin,
  deleteCourseMaterial,
);

module.exports = router;