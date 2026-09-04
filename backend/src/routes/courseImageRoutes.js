const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  uploadCourseImage,
} = require("../controllers/courseImageController");

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
  "../../uploads/course-banners",
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
      `-${baseName || "course-banner"}${extension}`;

    cb(null, uniqueName);
  },
});

/* =========================================================
   FILE VALIDATION
   ========================================================= */

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const validExtension = new Set([
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
    ]).has(extension);

    const validMimeType =
      allowedMimeTypes.has(file.mimetype);

    if (!validExtension || !validMimeType) {
      return cb(
        new Error(
          "Only JPG, PNG, and WEBP images are supported.",
        ),
      );
    }

    cb(null, true);
  },
});

/* =========================================================
   ADMIN COURSE BANNER UPLOAD
   ========================================================= */

router.post(
  "/upload",
  authenticateToken,
  authorizeAdmin,
  upload.single("image"),
  uploadCourseImage,
);

module.exports = router;