const express = require("express");

const {
  getActiveCategories,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/courseCategoryController");

const {
  authenticateToken,
  authorizeAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
 * PUBLIC
 * Get active course categories.
 */
router.get(
  "/",
  getActiveCategories,
);

/*
 * ADMIN
 * Get all categories, including inactive ones.
 */
router.get(
  "/admin/all",
  authenticateToken,
  authorizeAdmin,
  getAdminCategories,
);

/*
 * ADMIN
 * Create category.
 */
router.post(
  "/admin",
  authenticateToken,
  authorizeAdmin,
  createCategory,
);

/*
 * ADMIN
 * Update category.
 */
router.patch(
  "/admin/:id",
  authenticateToken,
  authorizeAdmin,
  updateCategory,
);

/*
 * ADMIN
 * Delete category.
 */
router.delete(
  "/admin/:id",
  authenticateToken,
  authorizeAdmin,
  deleteCategory,
);

module.exports = router;