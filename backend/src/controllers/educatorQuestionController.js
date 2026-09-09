const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const EducatorQuestion = require("../models/EducatorQuestion");
const { extractDocument } = require("../services/documentService");

/*
 * =========================================================
 * EDUCATOR QUESTION BANK CONTROLLER
 * =========================================================
 *
 * Workflow:
 *
 * Educator
 *    ↓
 * Upload PDF / DOCX / XLSX / XLS
 *    ↓
 * Extract question data
 *    ↓
 * Validate
 *    ↓
 * Detect duplicates
 *    ↓
 * Save valid questions
 *    ↓
 * Return Question Bank data
 *
 * The actual exam is NOT created here.
 * Teacher selects questions first and then uses BUILD TEST.
 * =========================================================
 */

const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".docx",
  ".xlsx",
  ".xls",
]);

const MAX_FILE_SIZE = 25 * 1024 * 1024;

/*
 * ---------------------------------------------------------
 * Utility helpers
 * ---------------------------------------------------------
 */

function cleanText(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function normalizeQuestionText(value) {
  return cleanText(value)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[“”"']/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim();
}

function createQuestionHash(questionText) {
  const normalized = normalizeQuestionText(questionText);

  return crypto
    .createHash("sha256")
    .update(normalized, "utf8")
    .digest("hex");
}

function normalizeQuestionType(value) {
  const normalized = cleanText(value)
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  const aliases = {
    MCQ: "MCQ",
    MULTIPLE_CHOICE: "MCQ",
    MULTIPLE_CHOICE_QUESTION: "MCQ",

    TRUE_FALSE: "TRUE_FALSE",
    TRUEFALSE: "TRUE_FALSE",

    MULTIPLE_SELECT: "MULTIPLE_SELECT",
    MULTI_SELECT: "MULTIPLE_SELECT",

    NUMERICAL: "NUMERICAL",
    NUMERIC: "NUMERICAL",

    SHORT_ANSWER: "SHORT_ANSWER",
    SHORTANSWER: "SHORT_ANSWER",

    LONG_ANSWER: "LONG_ANSWER",
    LONGANSWER: "LONG_ANSWER",
  };

  return aliases[normalized] || "MCQ";
}

function normalizeDifficulty(value) {
  const normalized = cleanText(value).toUpperCase();

  if (normalized === "EASY") {
    return "EASY";
  }

  if (normalized === "HARD") {
    return "HARD";
  }

  return "MEDIUM";
}

function normalizeSourceType(extension) {
  switch (extension.toLowerCase()) {
    case ".pdf":
      return "PDF";

    case ".docx":
      return "DOCX";

    case ".xlsx":
      return "XLSX";

    case ".xls":
      return "XLS";

    default:
      return "IMPORT";
  }
}

function normalizeAnswerKey(value) {
  const answer = cleanText(value).toUpperCase();

  if (!answer) {
    return [];
  }

  /*
   * Supports:
   *
   * A
   * A,B
   * A, B
   * A / B
   * A;B
   * OPTION A
   * OPTION A, OPTION C
   */

  const normalized = answer
    .replace(/OPTION\s+/g, "")
    .replace(/ANSWER\s*:\s*/g, "")
    .replace(/\//g, ",")
    .replace(/;/g, ",");

  return normalized
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const match = item.match(/[A-F]/);

      return match ? match[0] : item;
    });
}

function parseMarks(value) {
  const marks = Number(value);

  if (!Number.isFinite(marks) || marks <= 0) {
    return 1;
  }

  return marks;
}

function parseNegativeMarks(value) {
  if (
    value === undefined ||
    value === null ||
    cleanText(value) === ""
  ) {
    return 0;
  }

  const marks = Number(value);

  if (!Number.isFinite(marks) || marks < 0) {
    return 0;
  }

  return marks;
}

function getOptionValue(row, key) {
  if (!row || typeof row !== "object") {
    return "";
  }

  const possibleKeys = [
    key,
    key.toLowerCase(),
    key.toUpperCase(),
  ];

  for (const candidate of possibleKeys) {
    if (
      Object.prototype.hasOwnProperty.call(
        row,
        candidate,
      )
    ) {
      return cleanText(row[candidate]);
    }
  }

  return "";
}

/*
 * ---------------------------------------------------------
 * Convert Excel rows into standard question objects
 * ---------------------------------------------------------
 */

function parseExcelRows(rows) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows
    .map((row, index) => {
      const question =
        getOptionValue(row, "Question") ||
        getOptionValue(row, "QUESTION") ||
        getOptionValue(row, "Question Text") ||
        getOptionValue(row, "QUESTION TEXT");

      if (!question) {
        return null;
      }

      const optionA =
        getOptionValue(row, "Option A") ||
        getOptionValue(row, "OPTION A") ||
        getOptionValue(row, "A");

      const optionB =
        getOptionValue(row, "Option B") ||
        getOptionValue(row, "OPTION B") ||
        getOptionValue(row, "B");

      const optionC =
        getOptionValue(row, "Option C") ||
        getOptionValue(row, "OPTION C") ||
        getOptionValue(row, "C");

      const optionD =
        getOptionValue(row, "Option D") ||
        getOptionValue(row, "OPTION D") ||
        getOptionValue(row, "D");

      const correctAnswer =
        getOptionValue(row, "Correct Answer") ||
        getOptionValue(row, "CORRECT ANSWER") ||
        getOptionValue(row, "Answer") ||
        getOptionValue(row, "ANSWER");

      const explanation =
        getOptionValue(row, "Explanation") ||
        getOptionValue(row, "EXPLANATION");

      const subject =
        getOptionValue(row, "Subject") ||
        getOptionValue(row, "SUBJECT");

      const topic =
        getOptionValue(row, "Topic") ||
        getOptionValue(row, "TOPIC");

      const subtopic =
        getOptionValue(row, "Subtopic") ||
        getOptionValue(row, "SUBTOPIC");

      const difficulty =
        getOptionValue(row, "Difficulty") ||
        getOptionValue(row, "DIFFICULTY");

      const marks =
        getOptionValue(row, "Marks") ||
        getOptionValue(row, "MARKS");

      const negativeMarks =
        getOptionValue(row, "Negative Marks") ||
        getOptionValue(row, "NEGATIVE MARKS");

      const questionCode =
        getOptionValue(row, "Question ID") ||
        getOptionValue(row, "QUESTION ID") ||
        getOptionValue(row, "Question Code") ||
        getOptionValue(row, "QUESTION CODE") ||
        `Q${String(index + 1).padStart(3, "0")}`;

      return {
        questionCode,
        questionText: question,
        questionType: normalizeQuestionType(
          getOptionValue(row, "Question Type") ||
            getOptionValue(row, "QUESTION TYPE"),
        ),
        options: [
          {
            key: "A",
            text: optionA,
          },
          {
            key: "B",
            text: optionB,
          },
          {
            key: "C",
            text: optionC,
          },
          {
            key: "D",
            text: optionD,
          },
        ].filter((option) => option.text),
        correctAnswers: normalizeAnswerKey(
          correctAnswer,
        ),
        explanation,
        subject,
        topic,
        subtopic,
        difficulty: normalizeDifficulty(difficulty),
        defaultMarks: parseMarks(marks),
        defaultNegativeMarks:
          parseNegativeMarks(negativeMarks),
        sourceRow: index + 2,
      };
    })
    .filter(Boolean);
}

/*
 * ---------------------------------------------------------
 * Parse the official text question-bank format
 * ---------------------------------------------------------
 */

function parseTextQuestionBank(text) {
  const sourceText = cleanText(text);

  if (!sourceText) {
    return [];
  }

  const normalizedText = sourceText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  /*
   * QUESTION 001
   * QUESTION:
   * ...
   *
   * END OF QUESTION BANK
   */

  const questionBlocks = normalizedText
    .split(
      /(?=^\s*QUESTION\s+\d+\s*$)/gim,
    )
    .map((block) => block.trim())
    .filter((block) =>
      /^QUESTION\s+\d+/i.test(block),
    );

  const questions = [];

  for (let index = 0; index < questionBlocks.length; index += 1) {
    const block = questionBlocks[index];

    const questionIdMatch = block.match(
      /^QUESTION\s+(\d+)/i,
    );

    const questionCode = questionIdMatch
      ? `Q${String(
          Number(questionIdMatch[1]),
        ).padStart(3, "0")}`
      : `Q${String(index + 1).padStart(3, "0")}`;

    const extractSection = (
      sectionName,
      nextSections,
    ) => {
      const nextPattern = nextSections.join("|");

      const expression = new RegExp(
        `${sectionName}\\s*:\\s*([\\s\\S]*?)(?=\\n\\s*(?:${nextPattern})\\s*:|\\n\\s*END OF QUESTION BANK|$)`,
        "i",
      );

      const match = block.match(expression);

      return match ? cleanText(match[1]) : "";
    };

    const questionText = extractSection(
      "QUESTION",
      [
        "OPTION A",
        "OPTION B",
        "OPTION C",
        "OPTION D",
        "CORRECT ANSWER",
        "EXPLANATION",
        "SUBJECT",
        "TOPIC",
        "SUBTOPIC",
        "DIFFICULTY",
        "MARKS",
        "NEGATIVE MARKS",
      ],
    );

    const optionA = extractSection(
      "OPTION A",
      [
        "OPTION B",
        "OPTION C",
        "OPTION D",
        "CORRECT ANSWER",
        "EXPLANATION",
        "SUBJECT",
        "TOPIC",
        "SUBTOPIC",
        "DIFFICULTY",
        "MARKS",
        "NEGATIVE MARKS",
      ],
    );

    const optionB = extractSection(
      "OPTION B",
      [
        "OPTION C",
        "OPTION D",
        "CORRECT ANSWER",
        "EXPLANATION",
        "SUBJECT",
        "TOPIC",
        "SUBTOPIC",
        "DIFFICULTY",
        "MARKS",
        "NEGATIVE MARKS",
      ],
    );

    const optionC = extractSection(
      "OPTION C",
      [
        "OPTION D",
        "CORRECT ANSWER",
        "EXPLANATION",
        "SUBJECT",
        "TOPIC",
        "SUBTOPIC",
        "DIFFICULTY",
        "MARKS",
        "NEGATIVE MARKS",
      ],
    );

    const optionD = extractSection(
      "OPTION D",
      [
        "CORRECT ANSWER",
        "EXPLANATION",
        "SUBJECT",
        "TOPIC",
        "SUBTOPIC",
        "DIFFICULTY",
        "MARKS",
        "NEGATIVE MARKS",
      ],
    );

    const correctAnswer = extractSection(
      "CORRECT ANSWER",
      [
        "EXPLANATION",
        "SUBJECT",
        "TOPIC",
        "SUBTOPIC",
        "DIFFICULTY",
        "MARKS",
        "NEGATIVE MARKS",
      ],
    );

    const explanation = extractSection(
      "EXPLANATION",
      [
        "SUBJECT",
        "TOPIC",
        "SUBTOPIC",
        "DIFFICULTY",
        "MARKS",
        "NEGATIVE MARKS",
      ],
    );

    const subject = extractSection(
      "SUBJECT",
      [
        "TOPIC",
        "SUBTOPIC",
        "DIFFICULTY",
        "MARKS",
        "NEGATIVE MARKS",
      ],
    );

    const topic = extractSection(
      "TOPIC",
      [
        "SUBTOPIC",
        "DIFFICULTY",
        "MARKS",
        "NEGATIVE MARKS",
      ],
    );

    const subtopic = extractSection(
      "SUBTOPIC",
      [
        "DIFFICULTY",
        "MARKS",
        "NEGATIVE MARKS",
      ],
    );

    const difficulty = extractSection(
      "DIFFICULTY",
      [
        "MARKS",
        "NEGATIVE MARKS",
      ],
    );

    const marks = extractSection(
      "MARKS",
      ["NEGATIVE MARKS"],
    );

    const negativeMarks = extractSection(
      "NEGATIVE MARKS",
      [],
    );

    if (!questionText) {
      continue;
    }

    questions.push({
      questionCode,
      questionText,
      questionType: "MCQ",
      options: [
        {
          key: "A",
          text: optionA,
        },
        {
          key: "B",
          text: optionB,
        },
        {
          key: "C",
          text: optionC,
        },
        {
          key: "D",
          text: optionD,
        },
      ].filter((option) => option.text),
      correctAnswers:
        normalizeAnswerKey(correctAnswer),
      explanation,
      subject,
      topic,
      subtopic,
      difficulty:
        normalizeDifficulty(difficulty),
      defaultMarks: parseMarks(marks),
      defaultNegativeMarks:
        parseNegativeMarks(negativeMarks),
      sourceRow: index + 1,
    });
  }

  return questions;
}

/*
 * ---------------------------------------------------------
 * Validation
 * ---------------------------------------------------------
 */

function validateQuestion(question) {
  const errors = [];

  if (!cleanText(question.questionText)) {
    errors.push("Question text is missing.");
  }

  if (
    question.questionType === "MCQ" ||
    question.questionType ===
      "MULTIPLE_SELECT"
  ) {
    if (!Array.isArray(question.options)) {
      errors.push("Options are missing.");
    } else if (question.options.length < 2) {
      errors.push(
        "At least two options are required.",
      );
    }

    if (
      !Array.isArray(question.correctAnswers) ||
      question.correctAnswers.length === 0
    ) {
      errors.push(
        "Correct answer is missing.",
      );
    }
  }

  if (
    question.questionType === "TRUE_FALSE" &&
    (!Array.isArray(question.correctAnswers) ||
      question.correctAnswers.length === 0)
  ) {
    errors.push(
      "Correct answer is missing.",
    );
  }

  return errors;
}

/*
 * ---------------------------------------------------------
 * Build a clean question object for MongoDB
 * ---------------------------------------------------------
 */

function buildQuestionDocument(
  question,
  userId,
  sourceType,
  sourceFileName,
  importBatchId,
) {
  const questionText =
    cleanText(question.questionText);

  return {
    questionCode: cleanText(
      question.questionCode,
    ),

    questionHash:
      createQuestionHash(questionText),

    questionText,

    questionType:
      normalizeQuestionType(
        question.questionType,
      ),

    options: Array.isArray(question.options)
      ? question.options
          .map((option) => ({
            key: cleanText(option.key).toUpperCase(),
            text: cleanText(option.text),
          }))
          .filter((option) => option.text)
      : [],

    correctAnswers:
      Array.isArray(question.correctAnswers)
        ? question.correctAnswers
            .map((answer) =>
              cleanText(answer).toUpperCase(),
            )
            .filter(Boolean)
        : [],

    explanation: cleanText(
      question.explanation,
    ),

    subject: cleanText(question.subject),

    topic: cleanText(question.topic),

    subtopic: cleanText(question.subtopic),

    difficulty:
      normalizeDifficulty(question.difficulty),

    defaultMarks:
      parseMarks(question.defaultMarks),

    defaultNegativeMarks:
      parseNegativeMarks(
        question.defaultNegativeMarks,
      ),

    sourceType,

    sourceFileName: cleanText(
      sourceFileName,
    ),

    sourceRow:
      Number.isFinite(question.sourceRow)
        ? question.sourceRow
        : null,

    createdBy: userId,

    updatedBy: userId,

    status: "ACTIVE",

    importBatchId,
  };
}

/*
 * ---------------------------------------------------------
 * Duplicate detection
 * ---------------------------------------------------------
 */

async function findExistingQuestions(
  userId,
  questionHashes,
) {
  if (!questionHashes.length) {
    return [];
  }

  return EducatorQuestion.find({
    createdBy: userId,
    questionHash: {
      $in: questionHashes,
    },
  })
    .select(
      "_id questionCode questionHash questionText status",
    )
    .lean();
}

/*
 * ---------------------------------------------------------
 * Extract uploaded file
 * ---------------------------------------------------------
 */

async function extractUploadedFile(
  filePath,
  originalName,
) {
  const extension = path
    .extname(originalName)
    .toLowerCase();

  if (
    !ALLOWED_EXTENSIONS.has(extension)
  ) {
    throw new Error(
      "Only PDF, DOCX, XLSX and XLS files are supported.",
    );
  }

  const extracted =
    await extractDocument(
      filePath,
      originalName,
    );

  return {
    extension,
    extracted,
  };
}

/*
 * ---------------------------------------------------------
 * IMPORT QUESTION BANK
 * ---------------------------------------------------------
 *
 * POST /api/educator/questions/import
 *
 * multipart/form-data:
 * file=<PDF/DOCX/XLSX/XLS>
 * ---------------------------------------------------------
 */

async function importQuestionBank(
  req,
  res,
) {
  let uploadedFilePath = "";

  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Please upload a PDF, DOCX, XLSX or XLS question bank.",
      });
    }

    uploadedFilePath = req.file.path;

    if (
      req.file.size > MAX_FILE_SIZE
    ) {
      return res.status(400).json({
        success: false,
        message:
          "File is too large. Maximum allowed size is 25 MB.",
      });
    }

    const originalName =
      req.file.originalname;

    const {
      extension,
      extracted,
    } =
      await extractUploadedFile(
        uploadedFilePath,
        originalName,
      );

    const sourceType =
      normalizeSourceType(extension);

    /*
     * Excel files are already structured by
     * documentService. PDF/DOCX use extracted text.
     */
    let extractedQuestions = [];

    if (
      extension === ".xlsx" ||
      extension === ".xls"
    ) {
      if (
        Array.isArray(
          extracted.rows,
        )
      ) {
        extractedQuestions =
          parseExcelRows(
            extracted.rows,
          );
      } else {
        extractedQuestions =
          parseTextQuestionBank(
            extracted.text,
          );
      }
    } else {
      extractedQuestions =
        parseTextQuestionBank(
          extracted.text,
        );
    }

    if (!extractedQuestions.length) {
      return res.status(422).json({
        success: false,
        message:
          "No questions could be extracted. Please use the official JobWay question-bank format.",
        sourceFileName: originalName,
        sourceType,
      });
    }

    /*
     * Give every import a unique identifier.
     */
    const importBatchId =
      crypto.randomUUID();

    /*
     * Validate every extracted question.
     */
    const preparedQuestions =
      extractedQuestions.map(
        (question, index) => {
          const errors =
            validateQuestion(
              question,
            );

          const questionHash =
            createQuestionHash(
              question.questionText,
            );

          return {
            ...question,
            questionCode:
              question.questionCode ||
              `Q${String(
                index + 1,
              ).padStart(3, "0")}`,
            questionHash,
            validationErrors:
              errors,
            isValid:
              errors.length === 0,
          };
        },
      );

    const validQuestions =
      preparedQuestions.filter(
        (question) =>
          question.isValid,
      );

    /*
     * Detect duplicates already present in
     * this educator's question bank.
     */
    const existingQuestions =
      await findExistingQuestions(
        req.user.userId,
        validQuestions.map(
          (question) =>
            question.questionHash,
        ),
      );

    const existingHashSet =
      new Set(
        existingQuestions.map(
          (question) =>
            question.questionHash,
        ),
      );

    /*
     * Detect duplicate questions inside
     * the uploaded document itself.
     */
    const importHashSet =
      new Set();

    const results = [];

    for (
      const question of preparedQuestions
    ) {
      const duplicateInImport =
        importHashSet.has(
          question.questionHash,
        );

      if (question.isValid) {
        importHashSet.add(
          question.questionHash,
        );
      }

      const duplicateInBank =
        existingHashSet.has(
          question.questionHash,
        );

      let status = "READY";

      if (
        question.validationErrors.length
      ) {
        status = "NEEDS_REVIEW";
      } else if (
        duplicateInBank ||
        duplicateInImport
      ) {
        status = "DUPLICATE";
      }

      results.push({
        ...question,
        status,
        duplicateInBank,
        duplicateInImport,
      });
    }

    /*
     * Save only valid, non-duplicate questions.
     *
     * Questions requiring review or marked as
     * duplicate are returned to the frontend
     * but are not silently inserted.
     */
    const insertableQuestions =
      results.filter(
        (question) =>
          question.status ===
          "READY",
      );

    const documents =
      insertableQuestions.map(
        (question) =>
          buildQuestionDocument(
            question,
            req.user.userId,
            sourceType,
            originalName,
            importBatchId,
          ),
      );

    let insertedQuestions = [];

    if (documents.length) {
      try {
        insertedQuestions =
          await EducatorQuestion.insertMany(
            documents,
            {
              ordered: false,
            },
          );
      } catch (insertError) {
        /*
         * A duplicate race can still happen if
         * two imports arrive simultaneously.
         *
         * The unique database index remains the
         * final protection.
         */
        if (
          insertError?.writeErrors
        ) {
          insertedQuestions =
            insertError.insertedDocs ||
            [];
        } else {
          throw insertError;
        }
      }
    }

    const insertedHashSet =
      new Set(
        insertedQuestions.map(
          (question) =>
            question.questionHash,
        ),
      );

    /*
     * Return a safe representation.
     *
     * Correct answers are included here because
     * this endpoint is educator-only and is used
     * for teacher review.
     *
     * They are NEVER returned by the student
     * exam-start APIs.
     */
    const serializedQuestions =
      results.map((question) => ({
        id:
          insertedHashSet.has(
            question.questionHash,
          )
            ? insertedQuestions
                .find(
                  (item) =>
                    item.questionHash ===
                    question.questionHash,
                )?._id?.toString()
            : null,

        questionCode:
          question.questionCode,

        questionText:
          question.questionText,

        questionType:
          question.questionType,

        options:
          question.options,

        correctAnswers:
          question.correctAnswers,

        explanation:
          question.explanation,

        subject:
          question.subject,

        topic:
          question.topic,

        subtopic:
          question.subtopic,

        difficulty:
          question.difficulty,

        defaultMarks:
          question.defaultMarks,

        defaultNegativeMarks:
          question.defaultNegativeMarks,

        status:
          question.status,

        validationErrors:
          question.validationErrors,

        duplicateInBank:
          question.duplicateInBank,

        duplicateInImport:
          question.duplicateInImport,

        sourceRow:
          question.sourceRow,
      }));

    return res.status(201).json({
      success: true,

      message:
        "Question bank imported successfully.",

      importBatchId,

      sourceFileName:
        originalName,

      sourceType,

      summary: {
        extracted:
          preparedQuestions.length,

        valid:
          validQuestions.length,

        inserted:
          insertedQuestions.length,

        duplicates:
          results.filter(
            (question) =>
              question.status ===
              "DUPLICATE",
          ).length,

        needsReview:
          results.filter(
            (question) =>
              question.status ===
              "NEEDS_REVIEW",
          ).length,
      },

      questions:
        serializedQuestions,
    });
  } catch (error) {
    console.error(
      "Educator question-bank import error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to import question bank.",
    });
  } finally {
    if (uploadedFilePath) {
      await fs
        .unlink(uploadedFilePath)
        .catch(() => {});
    }
  }
}

/*
 * ---------------------------------------------------------
 * GET EDUCATOR QUESTION BANK
 * ---------------------------------------------------------
 */

async function getQuestions(
  req,
  res,
) {
  try {
    const {
      search = "",
      subject = "",
      topic = "",
      difficulty = "",
      status = "ACTIVE",
      page = "1",
      limit = "50",
    } = req.query;

    const currentPage = Math.max(
      1,
      Number(page) || 1,
    );

    const pageSize = Math.min(
      100,
      Math.max(
        1,
        Number(limit) || 50,
      ),
    );

    const filter = {
      createdBy: req.user.userId,
    };

    if (status) {
      filter.status = status;
    }

    if (subject) {
      filter.subject = new RegExp(
        cleanText(subject),
        "i",
      );
    }

    if (topic) {
      filter.topic = new RegExp(
        cleanText(topic),
        "i",
      );
    }

    if (difficulty) {
      filter.difficulty =
        cleanText(
          difficulty,
        ).toUpperCase();
    }

    if (search) {
      const searchRegex =
        new RegExp(
          cleanText(search),
          "i",
        );

      filter.$or = [
        {
          questionText:
            searchRegex,
        },
        {
          questionCode:
            searchRegex,
        },
        {
          subject:
            searchRegex,
        },
        {
          topic:
            searchRegex,
        },
      ];
    }

    const skip =
      (currentPage - 1) *
      pageSize;

    const [
      questions,
      total,
    ] = await Promise.all([
      EducatorQuestion.find(
        filter,
      )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(pageSize)
        .select(
          "_id questionCode questionHash questionText questionType options correctAnswers explanation subject topic subtopic difficulty defaultMarks defaultNegativeMarks sourceType sourceFileName sourceRow status createdAt updatedAt",
        )
        .lean(),

      EducatorQuestion.countDocuments(
        filter,
      ),
    ]);

    return res.json({
      success: true,

      questions:

        questions.map(
          (question) => ({
            id:
              question._id.toString(),

            questionCode:
              question.questionCode,

            questionHash:
              question.questionHash,

            questionText:
              question.questionText,

            questionType:
              question.questionType,

            options:
              question.options,

            correctAnswers:
              question.correctAnswers,

            explanation:
              question.explanation,

            subject:
              question.subject,

            topic:
              question.topic,

            subtopic:
              question.subtopic,

            difficulty:
              question.difficulty,

            defaultMarks:
              question.defaultMarks,

            defaultNegativeMarks:
              question.defaultNegativeMarks,

            sourceType:
              question.sourceType,

            sourceFileName:
              question.sourceFileName,

            sourceRow:
              question.sourceRow,

            status:
              question.status,

            createdAt:
              question.createdAt,

            updatedAt:
              question.updatedAt,
          }),
        ),

      pagination: {
        page: currentPage,
        limit: pageSize,
        total,
        totalPages:
          Math.ceil(
            total / pageSize,
          ),
      },
    });
  } catch (error) {
    console.error(
      "Get educator questions error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to load question bank.",
    });
  }
}

/*
 * ---------------------------------------------------------
 * GET SINGLE QUESTION
 * ---------------------------------------------------------
 */

async function getQuestion(
  req,
  res,
) {
  try {
    const question =
      await EducatorQuestion.findOne({
        _id: req.params.id,
        createdBy: req.user.userId,
      })
        .select(
          "_id questionCode questionHash questionText questionType options correctAnswers explanation subject topic subtopic difficulty defaultMarks defaultNegativeMarks sourceType sourceFileName sourceRow status createdAt updatedAt",
        )
        .lean();

    if (!question) {
      return res.status(404).json({
        success: false,
        message:
          "Question not found.",
      });
    }

    return res.json({
      success: true,

      question: {
        ...question,
        id:
          question._id.toString(),
      },
    });
  } catch (error) {
    console.error(
      "Get educator question error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to load question.",
    });
  }
}

/*
 * ---------------------------------------------------------
 * UPDATE QUESTION
 * ---------------------------------------------------------
 */

async function updateQuestion(
  req,
  res,
) {
  try {
    const question =
      await EducatorQuestion.findOne({
        _id: req.params.id,
        createdBy: req.user.userId,
      });

    if (!question) {
      return res.status(404).json({
        success: false,
        message:
          "Question not found.",
      });
    }

    const {
      questionCode,
      questionText,
      questionType,
      options,
      correctAnswers,
      explanation,
      subject,
      topic,
      subtopic,
      difficulty,
      defaultMarks,
      defaultNegativeMarks,
      status,
    } = req.body;

    if (
      questionText !== undefined
    ) {
      const cleaned =
        cleanText(questionText);

      if (!cleaned) {
        return res.status(400).json({
          success: false,
          message:
            "Question text cannot be empty.",
        });
      }

      question.questionText =
        cleaned;

      question.questionHash =
        createQuestionHash(
          cleaned,
        );
    }

    if (
      questionCode !== undefined
    ) {
      question.questionCode =
        cleanText(
          questionCode,
        );
    }

    if (
      questionType !== undefined
    ) {
      question.questionType =
        normalizeQuestionType(
          questionType,
        );
    }

    if (
      Array.isArray(options)
    ) {
      question.options =
        options
          .map((option) => ({
            key: cleanText(
              option.key,
            ).toUpperCase(),
            text: cleanText(
              option.text,
            ),
          }))
          .filter(
            (option) =>
              option.text,
          );
    }

    if (
      Array.isArray(correctAnswers)
    ) {
      question.correctAnswers =
        correctAnswers
          .map((answer) =>
            cleanText(
              answer,
            ).toUpperCase(),
          )
          .filter(Boolean);
    }

    if (
      explanation !== undefined
    ) {
      question.explanation =
        cleanText(
          explanation,
        );
    }

    if (
      subject !== undefined
    ) {
      question.subject =
        cleanText(subject);
    }

    if (
      topic !== undefined
    ) {
      question.topic =
        cleanText(topic);
    }

    if (
      subtopic !== undefined
    ) {
      question.subtopic =
        cleanText(
          subtopic,
        );
    }

    if (
      difficulty !== undefined
    ) {
      question.difficulty =
        normalizeDifficulty(
          difficulty,
        );
    }

    if (
      defaultMarks !== undefined
    ) {
      question.defaultMarks =
        parseMarks(
          defaultMarks,
        );
    }

    if (
      defaultNegativeMarks !==
      undefined
    ) {
      question.defaultNegativeMarks =
        parseNegativeMarks(
          defaultNegativeMarks,
        );
    }

    if (
      status !== undefined
    ) {
      const allowedStatuses = [
        "DRAFT",
        "ACTIVE",
        "ARCHIVED",
        "REJECTED",
      ];

      const normalizedStatus =
        cleanText(
          status,
        ).toUpperCase();

      if (
        allowedStatuses.includes(
          normalizedStatus,
        )
      ) {
        question.status =
          normalizedStatus;
      }
    }

    question.updatedBy =
      req.user.userId;

    await question.save();

    return res.json({
      success: true,
      message:
        "Question updated successfully.",

      question: {
        id:
          question._id.toString(),
        questionCode:
          question.questionCode,
        questionText:
          question.questionText,
        questionType:
          question.questionType,
        options:
          question.options,
        correctAnswers:
          question.correctAnswers,
        explanation:
          question.explanation,
        subject:
          question.subject,
        topic:
          question.topic,
        subtopic:
          question.subtopic,
        difficulty:
          question.difficulty,
        defaultMarks:
          question.defaultMarks,
        defaultNegativeMarks:
          question.defaultNegativeMarks,
        sourceType:
          question.sourceType,
        sourceFileName:
          question.sourceFileName,
        sourceRow:
          question.sourceRow,
        status:
          question.status,
      },
    });
  } catch (error) {
    console.error(
      "Update educator question error:",
      error,
    );

    if (
      error.code === 11000
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Another question with the same question content already exists in your question bank.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to update question.",
    });
  }
}

/*
 * ---------------------------------------------------------
 * ARCHIVE QUESTION
 * ---------------------------------------------------------
 */

async function archiveQuestion(
  req,
  res,
) {
  try {
    const question =
      await EducatorQuestion.findOneAndUpdate(
        {
          _id: req.params.id,
          createdBy: req.user.userId,
        },
        {
          $set: {
            status: "ARCHIVED",
            updatedBy:
              req.user.userId,
          },
        },
        {
          new: true,
        },
      );

    if (!question) {
      return res.status(404).json({
        success: false,
        message:
          "Question not found.",
      });
    }

    return res.json({
      success: true,
      message:
        "Question archived successfully.",
      questionId:
        question._id.toString(),
    });
  } catch (error) {
    console.error(
      "Archive educator question error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to archive question.",
    });
  }
}

/*
 * ---------------------------------------------------------
 * EXPORTS
 * ---------------------------------------------------------
 */

module.exports = {
  importQuestionBank,
  getQuestions,
  getQuestion,
  updateQuestion,
  archiveQuestion,
};