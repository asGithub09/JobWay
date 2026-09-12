const express = require("express");
const multer = require("multer");
const path = require("path");
const os = require("os");

const {
  authenticateToken,
  authorizeAdmin,
} = require("../middleware/authMiddleware");

const {
  importCourseMaterial,
} = require("../controllers/educatorCourseImportController");

const router = express.Router();

const upload = multer({
  dest: path.join(
    os.tmpdir(),
    "jobway-admin-course-imports"
  ),

  limits: {
    fileSize: 25 * 1024 * 1024,
  },

  fileFilter: (req, file, callback) => {
    const extension = path
      .extname(file.originalname || "")
      .toLowerCase();

    const allowedExtensions = new Set([
      ".pdf",
      ".docx",
      ".xlsx",
      ".xls",
    ]);

    if (!allowedExtensions.has(extension)) {
      return callback(
        new Error(
          "Only PDF, DOCX, XLSX and XLS files are supported."
        )
      );
    }

    callback(null, true);
  },
});

router.use(
  authenticateToken,
  authorizeAdmin
);

router.post(
  "/",
  upload.single("file"),
  importCourseMaterial
);

module.exports = router;
