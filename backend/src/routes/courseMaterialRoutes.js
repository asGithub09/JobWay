const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  uploadCourseMaterial,
} = require("../controllers/courseMaterialController");

const {
  authenticateToken,
  authorizeAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================================================
   UPLOAD DIRECTORY
   ========================================================= */

const uploadDirectory = path.join(
  __dirname,
  "../../uploads",
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

/* =========================================================
   MULTER STORAGE
   ========================================================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const baseName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80);

    const uniqueName =
      `${Date.now()}-${Math.round(Math.random() * 1e9)}` +
      `-${baseName || "course-material"}${extension}`;

    cb(null, uniqueName);
  },
});

/* =========================================================
   FILE VALIDATION
   ========================================================= */

const allowedMimeTypes = new Set([
  "application/pdf",

  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const upload = multer({
  storage,

  limits: {
    fileSize: 25 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const validExtension =
      extension === ".pdf" ||
      extension === ".docx";

    const validMimeType =
      allowedMimeTypes.has(file.mimetype);

    if (!validExtension || !validMimeType) {
      return cb(
        new Error(
          "Only PDF and DOCX files are supported.",
        ),
      );
    }

    cb(null, true);
  },
});

/* =========================================================
   COURSE MATERIAL ROUTES
   ========================================================= */

router.post(
  "/upload",
  authenticateToken,
  authorizeAdmin,
  upload.single("file"),
  uploadCourseMaterial,
);

module.exports = router;