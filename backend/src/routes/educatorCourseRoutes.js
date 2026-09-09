const express = require("express");

const {
  authenticateToken,
  authorizeEducator,
} = require("../middleware/authMiddleware");

const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  publishCourse,
  deleteCourse,
} = require("../controllers/educatorCourseController");

const router = express.Router();

router.use(authenticateToken, authorizeEducator);

router.get("/", getCourses);

router.get("/:id", getCourse);

router.post("/", createCourse);

router.patch("/:id", updateCourse);

router.post("/:id/publish", publishCourse);

router.delete("/:id", deleteCourse);

module.exports = router;