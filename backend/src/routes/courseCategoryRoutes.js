const express = require("express");

const {
  authenticateToken,
  authorizeAdmin,
} = require("../middleware/authMiddleware");

const {
  getActiveCategories,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/courseCategoryController");

const router = express.Router();

/*
 * PUBLIC
 * Get all active course categories.
 */
router.get(
  "/",
  getActiveCategories,
);

/*
 * ADMIN
 * Get all categories, including inactive categories.
 */
router.get(
  "/admin/all",
  authenticateToken,
  authorizeAdmin,
  getAdminCategories,
);

/*
 * ADMIN
 * Create a category.
 */
router.post(
  "/admin",
  authenticateToken,
  authorizeAdmin,
  createCategory,
);

/*
 * ADMIN
 * Update a category.
 */
router.patch(
  "/admin/:id",
  authenticateToken,
  authorizeAdmin,
  updateCategory,
);

/*
 * ADMIN
 * Delete a category.
 */
router.delete(
  "/admin/:id",
  authenticateToken,
  authorizeAdmin,
  deleteCategory,
);

module.exports = router;