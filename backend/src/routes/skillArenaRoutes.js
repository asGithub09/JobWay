const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  authenticateToken,
  authorizeAdmin,
} = require("../middleware/authMiddleware");

const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryLogo,
  removeCategoryLogo,
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getChallenges,
  createChallenge,
  updateChallenge,
  updateChallengeQuestions,
  publishChallenge,
  archiveChallenge,
  deleteChallenge,
} = require("../controllers/skillArena/skillArenaController");

const logoUploadDirectory = path.join(
  __dirname,
  "../../uploads/skill-arena/category-logos",
);

if (!fs.existsSync(logoUploadDirectory)) {
  fs.mkdirSync(logoUploadDirectory, {
    recursive: true,
  });
}

const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, logoUploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const baseName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60);

    const uniqueName =
      `${Date.now()}-${Math.round(Math.random() * 1e9)}` +
      `-${baseName || "skill-logo"}${extension}`;

    cb(null, uniqueName);
  },
});

const allowedLogoMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const skillArenaLogoUpload = multer({
  storage: logoStorage,

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
      allowedLogoMimeTypes.has(file.mimetype);

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
const router = express.Router();

router.use(
  authenticateToken,
  authorizeAdmin,
);


/*
 * ============================================================
 * CHALLENGES
 * ============================================================
 */

router.get(
  "/challenges",
  getChallenges,
);

router.post(
  "/challenges",
  createChallenge,
);

router.patch(
  "/challenges/:id",
  updateChallenge,
);

router.patch(
  "/challenges/:id/questions",
  updateChallengeQuestions,
);

router.post(
  "/challenges/:id/publish",
  publishChallenge,
);

router.post(
  "/challenges/:id/archive",
  archiveChallenge,
);

router.delete(
  "/challenges/:id",
  deleteChallenge,
);


/*
 * Categories
 */
router.get(
  "/categories",
  getCategories,
);

router.post(
  "/categories",
  createCategory,
);

router.patch(
  "/categories/:id",
  updateCategory,
);

router.delete(
  "/categories/:id",
  deleteCategory,
);

router.post(
  "/categories/:id/logo",
  skillArenaLogoUpload.single("image"),
  uploadCategoryLogo,
);

router.delete(
  "/categories/:id/logo",
  removeCategoryLogo,
);

/*
 * Questions
 */
router.get(
  "/questions",
  getQuestions,
);

router.post(
  "/questions",
  createQuestion,
);

router.patch(
  "/questions/:id",
  updateQuestion,
);

router.delete(
  "/questions/:id",
  deleteQuestion,
);

module.exports = router;







