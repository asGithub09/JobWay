const os = require("os");
const path = require("path");
const express = require("express");
const multer = require("multer");
const {
  authenticateToken,
  authorizeEducator,
} = require("../middleware/authMiddleware");
const {
  create,
  list,
  getOne,
  update,
  remove,
  publish,
  importDocument,
} = require("../controllers/courseV2Controller");
const {
  uploadEducatorCourseMedia,
} = require("../controllers/educatorCourseMediaController");

const router = express.Router();

const mediaUpload = multer({
  dest: path.join(
    os.tmpdir(),
    "jobway-educator-course-media"
  ),
  limits: {
    fileSize: 500 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    const mimeType = String(
      file.mimetype || ""
    ).toLowerCase();

    const allowedVideoTypes = new Set([
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-msvideo",
      "video/x-matroska",
    ]);

    if (!allowedVideoTypes.has(mimeType)) {
      return callback(
        new Error(
          "Only MP4, WebM, MOV, AVI and MKV video files are supported."
        )
      );
    }

    callback(null, true);
  },
});
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

router.use(authenticateToken, authorizeEducator);

router.post(
  "/media/upload",
  mediaUpload.single("file"),
  uploadEducatorCourseMedia
);
router.post(
  "/ai/import",
  upload.single("file"),
  importDocument
);

router.post("/:id/publish", publish);

router.post("/", create);
router.get("/", list);
router.get("/:id", getOne);
router.patch("/:id", update);
router.delete("/:id", remove);

module.exports = router;



