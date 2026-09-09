const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  authenticateToken,
  authorizeEducator,
} = require("../middleware/authMiddleware");

const {
  importQuestionBank,
  getQuestions,
  getQuestion,
  updateQuestion,
  archiveQuestion,
} = require("../controllers/educatorQuestionController");

const router = express.Router();

/*
 * =========================================================
 * EDUCATOR QUESTION BANK ROUTES
 * =========================================================
 *
 * Base URL:
 * /api/educator/questions
 *
 * All routes are educator-only.
 * =========================================================
 */

/*
 * ---------------------------------------------------------
 * Temporary upload directory
 * ---------------------------------------------------------
 */

const uploadDirectory = path.join(
  __dirname,
  "../../uploads/educator-question-bank",
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

/*
 * ---------------------------------------------------------
 * Multer configuration
 * ---------------------------------------------------------
 */

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (_req, file, cb) => {
    const extension =
      path.extname(file.originalname);

    const baseName = path
      .basename(
        file.originalname,
        extension,
      )
      .replace(
        /[^a-zA-Z0-9-_]/g,
        "_",
      );

    cb(
      null,
      `${Date.now()}-${baseName}${extension}`,
    );
  },
});

const allowedExtensions = new Set([
  ".pdf",
  ".docx",
  ".xlsx",
  ".xls",
]);

const upload = multer({
  storage,

  limits: {
    fileSize: 25 * 1024 * 1024,
  },

  fileFilter: (_req, file, cb) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    if (
      !allowedExtensions.has(
        extension,
      )
    ) {
      return cb(
        new Error(
          "Only PDF, DOCX, XLSX and XLS files are supported.",
        ),
      );
    }

    cb(null, true);
  },
});

/*
 * ---------------------------------------------------------
 * Authentication
 * ---------------------------------------------------------
 */

router.use(authenticateToken);
router.use(authorizeEducator);

/*
 * ---------------------------------------------------------
 * QUESTION BANK
 * ---------------------------------------------------------
 */

/*
 * GET
 * /api/educator/questions
 *
 * Load educator's question bank.
 */
router.get(
  "/",
  getQuestions,
);

/*
 * POST
 * /api/educator/questions/import
 *
 * Upload and import:
 * PDF
 * DOCX
 * XLSX
 * XLS
 */
router.post(
  "/import",
  upload.single("file"),
  importQuestionBank,
);

/*
 * GET
 * /api/educator/questions/:id
 *
 * Get one question.
 */
router.get(
  "/:id",
  getQuestion,
);

/*
 * PATCH
 * /api/educator/questions/:id
 *
 * Update question.
 */
router.patch(
  "/:id",
  updateQuestion,
);

/*
 * DELETE
 * /api/educator/questions/:id
 *
 * Archive question instead of physically
 * deleting it.
 */
router.delete(
  "/:id",
  archiveQuestion,
);

/*
 * ---------------------------------------------------------
 * MULTER ERROR HANDLER
 * ---------------------------------------------------------
 */

router.use(
  (
    error,
    _req,
    res,
    next,
  ) => {
    if (
      error instanceof
      multer.MulterError
    ) {
      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "File is too large. Maximum allowed size is 25 MB.",
        });
      }

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Unable to upload file.",
      });
    }

    if (error) {
      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Unable to process upload.",
      });
    }

    next();
  },
);

module.exports = router;