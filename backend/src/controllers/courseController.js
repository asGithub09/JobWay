const Course = require("../models/Course");

function sanitizeCourse(course) {
  return {
    id: course._id,
    title: course.title,
    slug: course.slug,
    category: course.category,
    level: course.level,
    description: course.description,
    bannerImage: course.bannerImage,
    duration: course.duration,
    language: course.language,
    price: course.price,
    discountPrice: course.discountPrice,
    instructor: course.instructor,
    features: course.features,
    syllabus: course.syllabus,
    isFeatured: course.isFeatured,
    isPublished: course.isPublished,
    interestedCount: course.interestedCount,
    enrolledCount: course.enrolledCount,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  };
}

function createSlug(value) {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/*
 * PUBLIC
 * Get all published courses.
 */
async function getPublishedCourses(req, res) {
  try {
    const courses = await Course.find({
      isPublished: true,
    }).sort({
      isFeatured: -1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      courses: courses.map(sanitizeCourse),
    });
  } catch (error) {
    console.error("Get published courses error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load courses",
    });
  }
}

/*
 * PUBLIC
 * Get one published course by slug.
 */
async function getPublishedCourse(req, res) {
  try {
    const { slug } = req.params;

    const course = await Course.findOne({
      slug: slug.toLowerCase(),
      isPublished: true,
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      course: sanitizeCourse(course),
    });
  } catch (error) {
    console.error("Get published course error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load course",
    });
  }
}

/*
 * ADMIN
 * Get every course, including unpublished courses.
 */
async function getAdminCourses(req, res) {
  try {
    const courses = await Course.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      courses: courses.map(sanitizeCourse),
    });
  } catch (error) {
    console.error("Get admin courses error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load courses",
    });
  }
}

/*
 * ADMIN
 * Create a new course.
 */
async function createCourse(req, res) {
  try {
    const {
      title,
      slug,
      category,
      level,
      description,
      bannerImage,
      duration,
      language,
      price,
      discountPrice,
      instructor,
      features,
      syllabus,
      isFeatured,
      isPublished,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Course title is required",
      });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: "Course category is required",
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Course description is required",
      });
    }

    const generatedSlug = createSlug(slug || title);

    if (!generatedSlug) {
      return res.status(400).json({
        success: false,
        message: "A valid course slug is required",
      });
    }

    const existingCourse = await Course.findOne({
      slug: generatedSlug,
    });

    if (existingCourse) {
      return res.status(409).json({
        success: false,
        message: "A course with this slug already exists",
      });
    }

    const course = await Course.create({
      title: title.trim(),
      slug: generatedSlug,
      category: category.trim(),
      level:
        typeof level === "string" && level.trim()
          ? level.trim()
          : "All Levels",
      description: description.trim(),
      bannerImage:
        typeof bannerImage === "string"
          ? bannerImage.trim()
          : "",
      duration:
        typeof duration === "string" && duration.trim()
          ? duration.trim()
          : "Self Paced",
      language:
        typeof language === "string" && language.trim()
          ? language.trim()
          : "English / Hindi",
      price: Number.isFinite(Number(price))
        ? Number(price)
        : 0,
      discountPrice: Number.isFinite(Number(discountPrice))
        ? Number(discountPrice)
        : 0,
      instructor:
        typeof instructor === "string"
          ? instructor.trim()
          : "",
      features: Array.isArray(features)
        ? features
            .filter(
              (feature) =>
                typeof feature === "string" &&
                feature.trim(),
            )
            .map((feature) => feature.trim())
        : [],
      syllabus: Array.isArray(syllabus)
        ? syllabus
            .filter(
              (item) =>
                item &&
                typeof item.title === "string" &&
                item.title.trim(),
            )
            .map((item) => ({
              title: item.title.trim(),
              description:
                typeof item.description === "string"
                  ? item.description.trim()
                  : "",
            }))
        : [],
      isFeatured: Boolean(isFeatured),
      isPublished: Boolean(isPublished),
    });

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      course: sanitizeCourse(course),
    });
  } catch (error) {
    console.error("Create course error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A course with this slug already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create course",
    });
  }
}

/*
 * ADMIN
 * Update an existing course.
 */
async function updateCourse(req, res) {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const {
      title,
      slug,
      category,
      level,
      description,
      bannerImage,
      duration,
      language,
      price,
      discountPrice,
      instructor,
      features,
      syllabus,
      isFeatured,
      isPublished,
    } = req.body;

    if (title !== undefined) {
      if (
        typeof title !== "string" ||
        title.trim().length < 2
      ) {
        return res.status(400).json({
          success: false,
          message: "Course title must contain at least 2 characters",
        });
      }

      course.title = title.trim();
    }

    if (category !== undefined) {
      if (
        typeof category !== "string" ||
        !category.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Course category is required",
        });
      }

      course.category = category.trim();
    }

    if (description !== undefined) {
      if (
        typeof description !== "string" ||
        !description.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Course description is required",
        });
      }

      course.description = description.trim();
    }

    if (slug !== undefined) {
      const nextSlug = createSlug(slug);

      if (!nextSlug) {
        return res.status(400).json({
          success: false,
          message: "A valid course slug is required",
        });
      }

      course.slug = nextSlug;
    }

    if (level !== undefined) {
      course.level =
        typeof level === "string"
          ? level.trim()
          : course.level;
    }

    if (bannerImage !== undefined) {
      course.bannerImage =
        typeof bannerImage === "string"
          ? bannerImage.trim()
          : course.bannerImage;
    }

    if (duration !== undefined) {
      course.duration =
        typeof duration === "string"
          ? duration.trim()
          : course.duration;
    }

    if (language !== undefined) {
      course.language =
        typeof language === "string"
          ? language.trim()
          : course.language;
    }

    if (price !== undefined) {
      const numericPrice = Number(price);

      if (!Number.isFinite(numericPrice) || numericPrice < 0) {
        return res.status(400).json({
          success: false,
          message: "Price must be a valid non-negative number",
        });
      }

      course.price = numericPrice;
    }

    if (discountPrice !== undefined) {
      const numericDiscountPrice = Number(discountPrice);

      if (
        !Number.isFinite(numericDiscountPrice) ||
        numericDiscountPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Discount price must be a valid non-negative number",
        });
      }

      course.discountPrice = numericDiscountPrice;
    }

    if (instructor !== undefined) {
      course.instructor =
        typeof instructor === "string"
          ? instructor.trim()
          : course.instructor;
    }

    if (features !== undefined) {
      if (!Array.isArray(features)) {
        return res.status(400).json({
          success: false,
          message: "Features must be an array",
        });
      }

      course.features = features
        .filter(
          (feature) =>
            typeof feature === "string" &&
            feature.trim(),
        )
        .map((feature) => feature.trim());
    }

    if (syllabus !== undefined) {
      if (!Array.isArray(syllabus)) {
        return res.status(400).json({
          success: false,
          message: "Syllabus must be an array",
        });
      }

      course.syllabus = syllabus
        .filter(
          (item) =>
            item &&
            typeof item.title === "string" &&
            item.title.trim(),
        )
        .map((item) => ({
          title: item.title.trim(),
          description:
            typeof item.description === "string"
              ? item.description.trim()
              : "",
        }));
    }

    if (isFeatured !== undefined) {
      course.isFeatured = Boolean(isFeatured);
    }

    if (isPublished !== undefined) {
      course.isPublished = Boolean(isPublished);
    }

    await course.save();

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course: sanitizeCourse(course),
    });
  } catch (error) {
    console.error("Update course error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A course with this slug already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update course",
    });
  }
}

/*
 * ADMIN
 * Publish or unpublish a course.
 */
async function toggleCoursePublish(req, res) {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    course.isPublished = !course.isPublished;

    await course.save();

    return res.status(200).json({
      success: true,
      message: course.isPublished
        ? "Course published successfully"
        : "Course unpublished successfully",
      course: sanitizeCourse(course),
    });
  } catch (error) {
    console.error("Toggle course publish error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update course publishing status",
    });
  }
}

/*
 * ADMIN
 * Delete a course.
 */
async function deleteCourse(req, res) {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    await Course.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete course error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete course",
    });
  }
}

module.exports = {
  getPublishedCourses,
  getPublishedCourse,
  getAdminCourses,
  createCourse,
  updateCourse,
  toggleCoursePublish,
  deleteCourse,
};