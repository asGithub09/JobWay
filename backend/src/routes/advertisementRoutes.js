const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  getActiveAdvertisement,
  getAdvertisements,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
} = require("../controllers/advertisementController");

const {
  authenticateToken,
  authorizeAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================================================
   TEMPORARY UPLOAD DIRECTORY
   ========================================================= */

const uploadDirectory = path.join(
  __dirname,
  "../../uploads/advertisements",
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

/* =========================================================
   MULTER CONFIGURATION
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
      `-${baseName || "advertisement"}${extension}`;

    cb(null, uniqueName);
  },
});

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
   PUBLIC LANDING PAGE
   ========================================================= */

router.get(
  "/active",
  getActiveAdvertisement,
);

/* =========================================================
   ADMIN MANAGEMENT
   ========================================================= */

router.get(
  "/",
  authenticateToken,
  authorizeAdmin,
  getAdvertisements,
);

router.post(
  "/",
  authenticateToken,
  authorizeAdmin,
  upload.single("image"),
  createAdvertisement,
);

router.patch(
  "/:id",
  authenticateToken,
  authorizeAdmin,
  updateAdvertisement,
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeAdmin,
  deleteAdvertisement,
);

module.exports = router;
