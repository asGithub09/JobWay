const CourseCategory = require("../models/CourseCategory");
const Course = require("../models/Course");

function createSlug(value) {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sanitizeCategory(category) {
  return {
    id: category._id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    icon: category.icon,
    image: category.image,
    isActive: category.isActive,
    displayOrder: category.displayOrder,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

/*
 * PUBLIC
 * Get all active course categories.
 */
async function getActiveCategories(req, res) {
  try {
    const categories = await CourseCategory.find({
      isActive: true,
    }).sort({
      displayOrder: 1,
      name: 1,
    });

    return res.status(200).json({
      success: true,
      categories: categories.map(sanitizeCategory),
    });
  } catch (error) {
    console.error("Get active course categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load course categories",
    });
  }
}

/*
 * ADMIN
 * Get all categories, including inactive categories.
 */
async function getAdminCategories(req, res) {
  try {
    const categories = await CourseCategory.find().sort({
      displayOrder: 1,
      name: 1,
    });

    return res.status(200).json({
      success: true,
      categories: categories.map(sanitizeCategory),
    });
  } catch (error) {
    console.error("Get admin course categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load course categories",
    });
  }
}

/*
 * ADMIN
 * Create a category.
 */
async function createCategory(req, res) {
  try {
    const {
      name,
      slug,
      description,
      icon,
      image,
      isActive,
      displayOrder,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const generatedSlug = createSlug(slug || name);

    if (!generatedSlug) {
      return res.status(400).json({
        success: false,
        message: "A valid category slug is required",
      });
    }

    const existingCategory = await CourseCategory.findOne({
      slug: generatedSlug,
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "A category with this slug already exists",
      });
    }

    const category = await CourseCategory.create({
      name: name.trim(),
      slug: generatedSlug,
      description:
        typeof description === "string"
          ? description.trim()
          : "",
      icon:
        typeof icon === "string"
          ? icon.trim()
          : "",
      image:
        typeof image === "string"
          ? image.trim()
          : "",
      isActive:
        isActive === undefined
          ? true
          : Boolean(isActive),
      displayOrder:
        Number.isFinite(Number(displayOrder)) &&
        Number(displayOrder) >= 0
          ? Number(displayOrder)
          : 0,
    });

    return res.status(201).json({
      success: true,
      message: "Course category created successfully",
      category: sanitizeCategory(category),
    });
  } catch (error) {
    console.error("Create course category error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A category with this slug already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create course category",
    });
  }
}

/*
 * ADMIN
 * Update a category.
 */
async function updateCategory(req, res) {
  try {
    const { id } = req.params;

    const category = await CourseCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Course category not found",
      });
    }

    const {
      name,
      slug,
      description,
      icon,
      image,
      isActive,
      displayOrder,
    } = req.body;

    if (name !== undefined) {
      if (
        typeof name !== "string" ||
        name.trim().length < 2
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Category name must contain at least 2 characters",
        });
      }

      category.name = name.trim();
    }

    if (slug !== undefined) {
      const nextSlug = createSlug(slug);

      if (!nextSlug) {
        return res.status(400).json({
          success: false,
          message: "A valid category slug is required",
        });
      }

      const duplicate = await CourseCategory.findOne({
        slug: nextSlug,
        _id: { $ne: id },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "A category with this slug already exists",
        });
      }

      category.slug = nextSlug;
    }

    if (description !== undefined) {
      category.description =
        typeof description === "string"
          ? description.trim()
          : category.description;
    }

    if (icon !== undefined) {
      category.icon =
        typeof icon === "string"
          ? icon.trim()
          : category.icon;
    }

    if (image !== undefined) {
      category.image =
        typeof image === "string"
          ? image.trim()
          : category.image;
    }

    if (isActive !== undefined) {
      category.isActive = Boolean(isActive);
    }

    if (displayOrder !== undefined) {
      const nextDisplayOrder = Number(displayOrder);

      if (
        !Number.isFinite(nextDisplayOrder) ||
        nextDisplayOrder < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Display order must be a valid non-negative number",
        });
      }

      category.displayOrder = nextDisplayOrder;
    }

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Course category updated successfully",
      category: sanitizeCategory(category),
    });
  } catch (error) {
    console.error("Update course category error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A category with this slug already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update course category",
    });
  }
}

/*
 * ADMIN
 * Delete a category.
 *
 * A category cannot be deleted while one or more
 * courses are using that category name.
 */
async function deleteCategory(req, res) {
  try {
    const { id } = req.params;

    const category = await CourseCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Course category not found",
      });
    }

    const coursesUsingCategory = await Course.countDocuments({
      category: category.name,
    });

    if (coursesUsingCategory > 0) {
      return res.status(409).json({
        success: false,
        message:
          `This category is currently used by ${coursesUsingCategory} course${
            coursesUsingCategory === 1 ? "" : "s"
          }. Deactivate it instead of deleting it.`,
        coursesUsingCategory,
      });
    }

    await CourseCategory.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Course category deleted successfully",
    });
  } catch (error) {
    console.error("Delete course category error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete course category",
    });
  }
}

module.exports = {
  getActiveCategories,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};