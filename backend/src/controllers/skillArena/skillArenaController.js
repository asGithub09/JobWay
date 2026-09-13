const fs = require("fs/promises");

const {
  uploadEducatorCourseMedia,
  deleteCloudinaryAsset,
} = require("../../services/cloudinaryService");

const SkillArenaCategory = require("../../models/SkillArenaCategory");
const SkillArenaQuestion = require("../../models/SkillArenaQuestion");
const SkillArenaChallenge = require("../../models/SkillArenaChallenge");

function cleanString(value, fallback = "") {
  if (value === undefined || value === null) {
    return fallback;
  }

  return String(value).trim();
}

function serializeCategory(category) {
  return {
    id: category._id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    icon: category.icon,
    logoUrl: category.logoUrl || "",
    logoPublicId: category.logoPublicId || "",
    accent: category.accent,
    displayOrder: category.displayOrder,
    isActive: category.isActive,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

function serializeQuestion(question) {
  return {
    id: question._id,
    questionCode: question.questionCode,
    questionText: question.questionText,
    questionType: question.questionType,
    category: question.category,
    subject: question.subject,
    topic: question.topic,
    subtopic: question.subtopic,
    difficulty: question.difficulty,
    language: question.language,
    options: question.options,
    code: question.code,
    starterCode: question.starterCode,
    constraints: question.constraints,
    testCases: question.testCases,
    tags: question.tags,
    sourceType: question.sourceType,
    sourceFileName: question.sourceFileName,
    sourceSection: question.sourceSection,
    sourceRow: question.sourceRow,
    importBatchId: question.importBatchId,
    status: question.status,
    timesUsed: question.timesUsed,
    lastUsedAt: question.lastUsedAt,
    createdBy: question.createdBy,
    updatedBy: question.updatedBy,
    createdAt: question.createdAt,
    updatedAt: question.updatedAt,
  };
}

/*
 * ============================================================
 * CATEGORIES
 * ============================================================
 */

async function getCategories(req, res) {
  try {
    const categories = await SkillArenaCategory.find({})
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      categories: categories.map(serializeCategory),
    });
  } catch (error) {
    console.error("Skill Arena category list error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load Skill Arena categories.",
    });
  }
}

async function createCategory(req, res) {
  try {
    const body = req.body || {};

    const name = cleanString(body.name);
    const slug = cleanString(body.slug).toLowerCase();

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: "Category name and slug are required.",
      });
    }

    const existing = await SkillArenaCategory.findOne({
      $or: [{ name }, { slug }],
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A Skill Arena category with this name or slug already exists.",
      });
    }

    const category = await SkillArenaCategory.create({
      name,
      slug,
      description: cleanString(body.description),
      icon: cleanString(body.icon, "sparkles"),
      accent: cleanString(body.accent, "blue"),
      displayOrder: Number.isFinite(Number(body.displayOrder))
        ? Math.max(0, Number(body.displayOrder))
        : 0,
      isActive: body.isActive !== false,
      createdBy: req.user.userId,
      updatedBy: req.user.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Skill Arena category created successfully.",
      category: serializeCategory(category),
    });
  } catch (error) {
    console.error("Skill Arena category create error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to create Skill Arena category.",
    });
  }
}

async function updateCategory(req, res) {
  try {
    const { id } = req.params;

    const category = await SkillArenaCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Skill Arena category not found.",
      });
    }

    const body = req.body || {};

    if (body.name !== undefined) {
      const name = cleanString(body.name);

      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Category name cannot be empty.",
        });
      }

      category.name = name;
    }

    if (body.slug !== undefined) {
      const slug = cleanString(body.slug).toLowerCase();

      if (!slug) {
        return res.status(400).json({
          success: false,
          message: "Category slug cannot be empty.",
        });
      }

      category.slug = slug;
    }

    if (body.description !== undefined) {
      category.description = cleanString(body.description);
    }

    if (body.icon !== undefined) {
      category.icon = cleanString(body.icon, "sparkles");
    }

    if (body.accent !== undefined) {
      category.accent = cleanString(body.accent, "blue");
    }

    if (body.displayOrder !== undefined) {
      const order = Number(body.displayOrder);

      if (!Number.isFinite(order) || order < 0) {
        return res.status(400).json({
          success: false,
          message: "Display order must be a non-negative number.",
        });
      }

      category.displayOrder = order;
    }

    if (body.isActive !== undefined) {
      category.isActive =
        body.isActive === true ||
        String(body.isActive).toLowerCase() === "true";
    }

    category.updatedBy = req.user.userId;

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Skill Arena category updated successfully.",
      category: serializeCategory(category),
    });
  } catch (error) {
    console.error("Skill Arena category update error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to update Skill Arena category.",
    });
  }
}

async function uploadCategoryLogo(req, res) {
  let uploadedFilePath = "";

  try {
    const { id } = req.params;

    const category = await SkillArenaCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Skill Arena category not found.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a skill logo image.",
      });
    }

    uploadedFilePath = req.file.path;

    const uploadedImage = await uploadEducatorCourseMedia(
      uploadedFilePath,
      {
        folder: "jobway/skill-arena/category-logos",
        resourceType: "image",
      },
    );

    const previousPublicId = category.logoPublicId || "";

    category.logoUrl = uploadedImage.secureUrl;
    category.logoPublicId = uploadedImage.publicId;
    category.updatedBy = req.user.userId;

    await category.save();

    if (
      previousPublicId &&
      previousPublicId !== uploadedImage.publicId
    ) {
      await deleteCloudinaryAsset(previousPublicId).catch(
        (cleanupError) => {
          console.warn(
            "Previous Skill Arena logo cleanup failed:",
            cleanupError.message,
          );
        },
      );
    }

    return res.status(201).json({
      success: true,
      message: "Skill Arena logo uploaded successfully.",
      logoUrl: uploadedImage.secureUrl,
      logoPublicId: uploadedImage.publicId,
      category: serializeCategory(category),
    });
  } catch (error) {
    console.error(
      "Skill Arena category logo upload error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to upload Skill Arena category logo.",
    });
  } finally {
    if (uploadedFilePath) {
      await fs.unlink(uploadedFilePath).catch(() => {});
    }
  }
}

async function removeCategoryLogo(req, res) {
  try {
    const { id } = req.params;

    const category = await SkillArenaCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Skill Arena category not found.",
      });
    }

    const publicId = category.logoPublicId || "";

    if (publicId) {
      await deleteCloudinaryAsset(publicId);
    }

    category.logoUrl = "";
    category.logoPublicId = "";
    category.updatedBy = req.user.userId;

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Skill Arena logo removed successfully.",
      category: serializeCategory(category),
    });
  } catch (error) {
    console.error(
      "Skill Arena category logo removal error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to remove Skill Arena category logo.",
    });
  }
}
async function deleteCategory(req, res) {
  try {
    const { id } = req.params;

    const category = await SkillArenaCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Skill Arena category not found.",
      });
    }

    const questionCount = await SkillArenaQuestion.countDocuments({
      category: id,
      status: { $ne: "ARCHIVED" },
    });

    if (questionCount > 0) {
      return res.status(409).json({
        success: false,
        message:
          "This category contains active Skill Arena questions. Archive or move those questions before deleting the category.",
      });
    }

    await SkillArenaCategory.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Skill Arena category deleted successfully.",
    });
  } catch (error) {
    console.error("Skill Arena category delete error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete Skill Arena category.",
    });
  }
}

/*
 * ============================================================
 * QUESTIONS
 * ============================================================
 */

async function getQuestions(req, res) {
  try {
    const {
      search,
      category,
      subject,
      topic,
      difficulty,
      questionType,
      status,
    } = req.query || {};

    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (subject) {
      filter.subject = subject;
    }

    if (topic) {
      filter.topic = topic;
    }

    if (difficulty) {
      filter.difficulty = String(difficulty).toUpperCase();
    }

    if (questionType) {
      filter.questionType = String(questionType).toUpperCase();
    }

    if (status) {
      filter.status = String(status).toUpperCase();
    }

    if (search) {
      const escaped = String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      if (escaped) {
        const regex = new RegExp(escaped, "i");

        filter.$or = [
          { questionCode: regex },
          { questionText: regex },
          { subject: regex },
          { topic: regex },
        ];
      }
    }

    const questions = await SkillArenaQuestion.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      questions: questions.map(serializeQuestion),
      total: questions.length,
    });
  } catch (error) {
    console.error("Skill Arena question list error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load Skill Arena questions.",
    });
  }
}

async function createQuestion(req, res) {
  try {
    const body = req.body || {};

    const questionCode = cleanString(body.questionCode).toUpperCase();
    const questionText = cleanString(body.questionText);
    const questionType =
      cleanString(body.questionType, "MCQ").toUpperCase();
    const category = cleanString(body.category);
    const subject = cleanString(body.subject);

    if (
      !questionCode ||
      !questionText ||
      !category ||
      !subject
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Question code, question text, category and subject are required.",
      });
    }

    if (!["MCQ", "CODING", "SQL"].includes(questionType)) {
      return res.status(400).json({
        success: false,
        message: "Unsupported Skill Arena question type.",
      });
    }

    const categoryExists =
      await SkillArenaCategory.exists({
        _id: category,
      });

    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Selected Skill Arena category does not exist.",
      });
    }

    const existing =
      await SkillArenaQuestion.findOne({
        questionCode,
      });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A Skill Arena question with this code already exists.",
      });
    }

    const question = await SkillArenaQuestion.create({
      questionCode,
      questionText,
      questionType,
      category,
      subject,
      topic: cleanString(body.topic),
      subtopic: cleanString(body.subtopic),
      difficulty: cleanString(body.difficulty, "MEDIUM").toUpperCase(),
      language: cleanString(body.language),
      options: Array.isArray(body.options) ? body.options : [],
      correctAnswer: cleanString(body.correctAnswer),
      explanation: cleanString(body.explanation),
      code: cleanString(body.code),
      starterCode: cleanString(body.starterCode),
      constraints: cleanString(body.constraints),
      testCases: Array.isArray(body.testCases) ? body.testCases : [],
      tags: Array.isArray(body.tags) ? body.tags : [],
      sourceType: cleanString(body.sourceType, "MANUAL").toUpperCase(),
      sourceFileName: cleanString(body.sourceFileName),
      sourceSection: cleanString(body.sourceSection),
      sourceRow: body.sourceRow || null,
      importBatchId: cleanString(body.importBatchId),
      status: cleanString(body.status, "ACTIVE").toUpperCase(),
      createdBy: req.user.userId,
      updatedBy: req.user.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Skill Arena question created successfully.",
      question: serializeQuestion(question),
    });
  } catch (error) {
    console.error("Skill Arena question create error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to create Skill Arena question.",
    });
  }
}

async function updateQuestion(req, res) {
  try {
    const { id } = req.params;

    const question = await SkillArenaQuestion.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Skill Arena question not found.",
      });
    }

    const body = req.body || {};

    const editableStrings = [
      "questionText",
      "subject",
      "topic",
      "subtopic",
      "language",
      "code",
      "starterCode",
      "constraints",
      "sourceFileName",
      "sourceSection",
      "importBatchId",
    ];

    editableStrings.forEach((field) => {
      if (body[field] !== undefined) {
        question[field] = cleanString(body[field]);
      }
    });

    if (body.questionType !== undefined) {
      const questionType =
        cleanString(body.questionType).toUpperCase();

      if (!["MCQ", "CODING", "SQL"].includes(questionType)) {
        return res.status(400).json({
          success: false,
          message: "Unsupported Skill Arena question type.",
        });
      }

      question.questionType = questionType;
    }

    if (body.category !== undefined) {
      const categoryExists =
        await SkillArenaCategory.exists({
          _id: body.category,
        });

      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: "Selected Skill Arena category does not exist.",
        });
      }

      question.category = body.category;
    }

    if (body.difficulty !== undefined) {
      question.difficulty =
        cleanString(body.difficulty).toUpperCase();
    }

    if (body.options !== undefined) {
      question.options = Array.isArray(body.options)
        ? body.options
        : [];
    }

    if (body.correctAnswer !== undefined) {
      question.correctAnswer =
        cleanString(body.correctAnswer);
    }

    if (body.explanation !== undefined) {
      question.explanation =
        cleanString(body.explanation);
    }

    if (body.testCases !== undefined) {
      question.testCases = Array.isArray(body.testCases)
        ? body.testCases
        : [];
    }

    if (body.tags !== undefined) {
      question.tags = Array.isArray(body.tags)
        ? body.tags
        : [];
    }

    if (body.status !== undefined) {
      question.status =
        cleanString(body.status).toUpperCase();
    }

    question.updatedBy = req.user.userId;

    await question.save();

    return res.status(200).json({
      success: true,
      message: "Skill Arena question updated successfully.",
      question: serializeQuestion(question),
    });
  } catch (error) {
    console.error("Skill Arena question update error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to update Skill Arena question.",
    });
  }
}

async function deleteQuestion(req, res) {
  try {
    const { id } = req.params;

    const question = await SkillArenaQuestion.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Skill Arena question not found.",
      });
    }

    /*
     * Published challenge protection will be added when the
     * SkillArenaChallenge controller is introduced.
     *
     * For now, questions that have already been used are archived
     * instead of being permanently destroyed.
     */
    if (question.timesUsed > 0) {
      question.status = "ARCHIVED";
      question.updatedBy = req.user.userId;

      await question.save();

      return res.status(200).json({
        success: true,
        archived: true,
        message:
          "This question has already been used and was archived instead of permanently deleted.",
      });
    }

    await SkillArenaQuestion.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      deleted: true,
      message: "Skill Arena question deleted successfully.",
    });
  } catch (error) {
    console.error("Skill Arena question delete error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete Skill Arena question.",
    });
  }
}


/*
 * ============================================================
 * CHALLENGES
 * ============================================================
 */

function serializeChallenge(challenge) {
  if (!challenge) {
    return null;
  }

  return {
    id: challenge._id,
    title: challenge.title,
    slug: challenge.slug,
    description: challenge.description,
    category: challenge.category,
    subject: challenge.subject,
    difficulty: challenge.difficulty,
    durationMinutes: challenge.durationMinutes,
    totalMarks: challenge.totalMarks,
    rewardPoints: challenge.rewardPoints,
    rewardKey: challenge.rewardKey,
    questions: challenge.questions,
    status: challenge.status,
    publishedAt: challenge.publishedAt,
    createdBy: challenge.createdBy,
    updatedBy: challenge.updatedBy,
    createdAt: challenge.createdAt,
    updatedAt: challenge.updatedAt,
  };
}

function calculateTotalMarks(questions) {
  return questions.reduce(
    (total, item) => total + Number(item.marks || 0),
    0,
  );
}

function normalizeChallengeQuestions(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item, index) => ({
    question: item.question || item.questionId,
    order: Number.isFinite(Number(item.order))
      ? Number(item.order)
      : index,
    marks: Number.isFinite(Number(item.marks))
      ? Math.max(0, Number(item.marks))
      : 1,
    negativeMarks: Number.isFinite(Number(item.negativeMarks))
      ? Math.max(0, Number(item.negativeMarks))
      : 0,
  }));
}

async function validateChallengeQuestions(items, categoryId) {
  if (!Array.isArray(items) || items.length === 0) {
    return {
      valid: false,
      message: "A challenge must contain at least one question.",
    };
  }

  const normalized = normalizeChallengeQuestions(items);

  const ids = normalized.map((item) => item.question);

  if (ids.some((id) => !id)) {
    return {
      valid: false,
      message: "Every challenge question must have a valid question ID.",
    };
  }

  const uniqueIds = new Set(ids.map(String));

  if (uniqueIds.size !== ids.length) {
    return {
      valid: false,
      message: "A challenge cannot contain the same question more than once.",
    };
  }

  const questions = await SkillArenaQuestion.find({
    _id: { $in: ids },
  })
    .select("_id category status")
    .lean();

  if (questions.length !== ids.length) {
    return {
      valid: false,
      message: "One or more selected Skill Arena questions no longer exist.",
    };
  }

  const questionMap = new Map(
    questions.map((question) => [
      String(question._id),
      question,
    ]),
  );

  for (const item of normalized) {
    const question = questionMap.get(String(item.question));

    if (!question) {
      return {
        valid: false,
        message: "A selected Skill Arena question could not be found.",
      };
    }

    if (String(question.category) !== String(categoryId)) {
      return {
        valid: false,
        message:
          "All questions in a challenge must belong to the selected Skill Arena category.",
      };
    }

    if (question.status !== "ACTIVE") {
      return {
        valid: false,
        message:
          "Only ACTIVE Skill Arena questions can be added to a challenge.",
      };
    }
  }

  return {
    valid: true,
    questions: normalized,
  };
}

async function getChallenges(req, res) {
  try {
    const {
      category,
      subject,
      difficulty,
      status,
      search,
    } = req.query || {};

    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (subject) {
      filter.subject = subject;
    }

    if (difficulty) {
      filter.difficulty = String(difficulty).toUpperCase();
    }

    if (status) {
      filter.status = String(status).toUpperCase();
    }

    if (search) {
      const escaped = String(search)
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      if (escaped) {
        const regex = new RegExp(escaped, "i");

        filter.$or = [
          { title: regex },
          { slug: regex },
          { subject: regex },
        ];
      }
    }

    const challenges = await SkillArenaChallenge.find(filter)
      .populate("category", "name slug icon accent")
      .populate(
        "questions.question",
        "questionCode questionText questionType subject topic difficulty status",
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      challenges: challenges.map(serializeChallenge),
      total: challenges.length,
    });
  } catch (error) {
    console.error("Skill Arena challenge list error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load Skill Arena challenges.",
    });
  }
}

async function createChallenge(req, res) {
  try {
    const body = req.body || {};

    const title = cleanString(body.title);
    const slug = cleanString(body.slug).toLowerCase();
    const category = cleanString(body.category);
    const subject = cleanString(body.subject);

    if (!title || !slug || !category || !subject) {
      return res.status(400).json({
        success: false,
        message:
          "Challenge title, slug, category and subject are required.",
      });
    }

    const categoryExists =
      await SkillArenaCategory.exists({
        _id: category,
      });

    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Selected Skill Arena category does not exist.",
      });
    }

    const existing =
      await SkillArenaChallenge.findOne({ slug });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A Skill Arena challenge with this slug already exists.",
      });
    }

    const validation = await validateChallengeQuestions(
      body.questions || [],
      category,
    );

    if (!validation.valid && Array.isArray(body.questions) && body.questions.length > 0) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    const questions = validation.valid
      ? validation.questions
      : [];

    const challenge = await SkillArenaChallenge.create({
      title,
      slug,
      description: cleanString(body.description),
      category,
      subject,
      difficulty: cleanString(
        body.difficulty,
        "MEDIUM",
      ).toUpperCase(),
      durationMinutes: Number.isFinite(Number(body.durationMinutes))
        ? Math.min(
            Math.max(Number(body.durationMinutes), 1),
            180,
          )
        : 10,
      totalMarks: calculateTotalMarks(questions),
      rewardPoints: Number.isFinite(Number(body.rewardPoints))
        ? Math.max(Number(body.rewardPoints), 0)
        : 0,
      rewardKey: cleanString(body.rewardKey),
      questions,
      status: "DRAFT",
      createdBy: req.user.userId,
      updatedBy: req.user.userId,
    });

    const populated = await SkillArenaChallenge.findById(
      challenge._id,
    )
      .populate("category", "name slug icon accent")
      .populate(
        "questions.question",
        "questionCode questionText questionType subject topic difficulty status",
      )
      .lean();

    return res.status(201).json({
      success: true,
      message: "Skill Arena challenge created successfully.",
      challenge: serializeChallenge(populated),
    });
  } catch (error) {
    console.error("Skill Arena challenge create error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A Skill Arena challenge with this slug already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message || "Unable to create Skill Arena challenge.",
    });
  }
}

async function updateChallenge(req, res) {
  try {
    const { id } = req.params;

    const challenge =
      await SkillArenaChallenge.findById(id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: "Skill Arena challenge not found.",
      });
    }

    if (challenge.status !== "DRAFT") {
      return res.status(409).json({
        success: false,
        message:
          "Only draft Skill Arena challenges can be edited.",
      });
    }

    const body = req.body || {};

    if (body.title !== undefined) {
      const title = cleanString(body.title);

      if (!title) {
        return res.status(400).json({
          success: false,
          message: "Challenge title cannot be empty.",
        });
      }

      challenge.title = title;
    }

    if (body.slug !== undefined) {
      const slug = cleanString(body.slug).toLowerCase();

      if (!slug) {
        return res.status(400).json({
          success: false,
          message: "Challenge slug cannot be empty.",
        });
      }

      const duplicate =
        await SkillArenaChallenge.findOne({
          slug,
          _id: { $ne: challenge._id },
        });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message:
            "Another Skill Arena challenge already uses this slug.",
        });
      }

      challenge.slug = slug;
    }

    if (body.description !== undefined) {
      challenge.description =
        cleanString(body.description);
    }

    if (body.category !== undefined) {
      const category = cleanString(body.category);

      const exists =
        await SkillArenaCategory.exists({
          _id: category,
        });

      if (!exists) {
        return res.status(400).json({
          success: false,
          message:
            "Selected Skill Arena category does not exist.",
        });
      }

      challenge.category = category;
    }

    if (body.subject !== undefined) {
      challenge.subject = cleanString(body.subject);

      if (!challenge.subject) {
        return res.status(400).json({
          success: false,
          message: "Challenge subject cannot be empty.",
        });
      }
    }

    if (body.difficulty !== undefined) {
      challenge.difficulty =
        cleanString(body.difficulty).toUpperCase();
    }

    if (body.durationMinutes !== undefined) {
      const duration = Number(body.durationMinutes);

      if (
        !Number.isFinite(duration) ||
        duration < 1 ||
        duration > 180
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Challenge duration must be between 1 and 180 minutes.",
        });
      }

      challenge.durationMinutes = duration;
    }

    if (body.rewardPoints !== undefined) {
      const points = Number(body.rewardPoints);

      if (!Number.isFinite(points) || points < 0) {
        return res.status(400).json({
          success: false,
          message:
            "Reward points must be a non-negative number.",
        });
      }

      challenge.rewardPoints = points;
    }

    if (body.rewardKey !== undefined) {
      challenge.rewardKey =
        cleanString(body.rewardKey);
    }

    if (body.questions !== undefined) {
      const validation =
        await validateChallengeQuestions(
          body.questions,
          challenge.category,
        );

      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.message,
        });
      }

      challenge.questions = validation.questions;
      challenge.totalMarks =
        calculateTotalMarks(validation.questions);
    }

    challenge.updatedBy = req.user.userId;

    await challenge.save();

    const populated = await SkillArenaChallenge.findById(
      challenge._id,
    )
      .populate("category", "name slug icon accent")
      .populate(
        "questions.question",
        "questionCode questionText questionType subject topic difficulty status",
      )
      .lean();

    return res.status(200).json({
      success: true,
      message: "Skill Arena challenge updated successfully.",
      challenge: serializeChallenge(populated),
    });
  } catch (error) {
    console.error("Skill Arena challenge update error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Unable to update Skill Arena challenge.",
    });
  }
}

async function updateChallengeQuestions(req, res) {
  try {
    const { id } = req.params;

    const challenge =
      await SkillArenaChallenge.findById(id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: "Skill Arena challenge not found.",
      });
    }

    if (challenge.status !== "DRAFT") {
      return res.status(409).json({
        success: false,
        message:
          "Questions can only be changed while the challenge is a draft.",
      });
    }

    const validation =
      await validateChallengeQuestions(
        req.body?.questions,
        challenge.category,
      );

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    challenge.questions = validation.questions;
    challenge.totalMarks =
      calculateTotalMarks(validation.questions);
    challenge.updatedBy = req.user.userId;

    await challenge.save();

    const populated = await SkillArenaChallenge.findById(
      challenge._id,
    )
      .populate("category", "name slug icon accent")
      .populate(
        "questions.question",
        "questionCode questionText questionType subject topic difficulty status",
      )
      .lean();

    return res.status(200).json({
      success: true,
      message: "Challenge questions updated successfully.",
      challenge: serializeChallenge(populated),
    });
  } catch (error) {
    console.error(
      "Skill Arena challenge questions update error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to update challenge questions.",
    });
  }
}

async function publishChallenge(req, res) {
  try {
    const { id } = req.params;

    const challenge =
      await SkillArenaChallenge.findById(id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: "Skill Arena challenge not found.",
      });
    }

    if (challenge.status !== "DRAFT") {
      return res.status(409).json({
        success: false,
        message:
          "Only draft Skill Arena challenges can be published.",
      });
    }

    const category =
      await SkillArenaCategory.findById(
        challenge.category,
      );

    if (!category || !category.isActive) {
      return res.status(400).json({
        success: false,
        message:
          "The challenge category must be active before publishing.",
      });
    }

    const validation =
      await validateChallengeQuestions(
        challenge.questions,
        challenge.category,
      );

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    challenge.questions = validation.questions;
    challenge.totalMarks =
      calculateTotalMarks(validation.questions);
    challenge.status = "PUBLISHED";
    challenge.publishedAt = new Date();
    challenge.updatedBy = req.user.userId;

    await challenge.save();

    /*
     * Mark questions as used only after the challenge itself
     * has successfully become published.
     */
    const questionIds = validation.questions.map(
      (item) => item.question,
    );

    await SkillArenaQuestion.updateMany(
      {
        _id: { $in: questionIds },
      },
      {
        $inc: { timesUsed: 1 },
        $set: {
          lastUsedAt: new Date(),
        },
      },
    );

    const populated = await SkillArenaChallenge.findById(
      challenge._id,
    )
      .populate("category", "name slug icon accent")
      .populate(
        "questions.question",
        "questionCode questionText questionType subject topic difficulty status",
      )
      .lean();

    return res.status(200).json({
      success: true,
      message: "Skill Arena challenge published successfully.",
      challenge: serializeChallenge(populated),
    });
  } catch (error) {
    console.error("Skill Arena challenge publish error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Unable to publish Skill Arena challenge.",
    });
  }
}

async function archiveChallenge(req, res) {
  try {
    const { id } = req.params;

    const challenge =
      await SkillArenaChallenge.findById(id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: "Skill Arena challenge not found.",
      });
    }

    if (challenge.status === "ARCHIVED") {
      return res.status(200).json({
        success: true,
        message: "Skill Arena challenge is already archived.",
        challenge: serializeChallenge(challenge),
      });
    }

    challenge.status = "ARCHIVED";
    challenge.updatedBy = req.user.userId;

    await challenge.save();

    return res.status(200).json({
      success: true,
      message: "Skill Arena challenge archived successfully.",
      challenge: serializeChallenge(challenge),
    });
  } catch (error) {
    console.error("Skill Arena challenge archive error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to archive Skill Arena challenge.",
    });
  }
}

async function deleteChallenge(req, res) {
  try {
    const { id } = req.params;

    const challenge =
      await SkillArenaChallenge.findById(id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: "Skill Arena challenge not found.",
      });
    }

    if (challenge.status !== "DRAFT") {
      return res.status(409).json({
        success: false,
        message:
          "Only draft Skill Arena challenges can be permanently deleted. Published or archived challenges must remain available as historical records.",
      });
    }

    await SkillArenaChallenge.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Draft Skill Arena challenge deleted successfully.",
    });
  } catch (error) {
    console.error("Skill Arena challenge delete error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete Skill Arena challenge.",
    });
  }
}
module.exports = {
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
};


