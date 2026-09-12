const fs = require("fs/promises");
const path = require("path");

const EducatorCourseDraft = require("../models/EducatorCourseDraft");

const {
  extractDocument,
} = require("../services/documentService");

const {
  detectCourseStructure,
} = require("../services/courseStructureService");

const {
  buildModules,
  buildPractice,
  buildSourceSections,
} = require("../services/courseFactoryService");

function createInitialCourseData(fileName) {
  const baseName = path.basename(
    fileName || "Course Material",
    path.extname(fileName || "")
  );

  const cleanTitle = baseName
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    title: cleanTitle || "Untitled Course",

    category: "General",

    level: "All Levels",

    description:
      "Course generated from the uploaded teaching material.",

    duration: "Self Paced",

    language: "English / Hindi",

    features: [
      "Structured learning content",
      "Topic-wise lessons",
      "Reviewable course draft",
    ],
  };
}

function createCourseDescription(
  fileName,
  modules
) {
  const moduleTitles = modules
    .map((module) => module.title)
    .filter(Boolean)
    .slice(0, 8);

  if (moduleTitles.length) {
    return (
      `This course was generated from ${fileName}. ` +
      `It covers ${moduleTitles.join(", ")}.`
    );
  }

  return (
    `Course draft generated from ${fileName}.`
  );
}

function serializeDraft(draft) {
  return {
    id: draft._id.toString(),

    title: draft.title,

    category: draft.category,

    level: draft.level,

    description: draft.description,

    duration: draft.duration,

    language: draft.language,

    features: draft.features,

    modules: draft.modules,

    practice: draft.practice,

    sourceSections: draft.sourceSections,

    summary: draft.summary,

    sourceFileName:
      draft.sourceFileName,

    sourceExtension:
      draft.sourceExtension,

    sourceMimeType:
      draft.sourceMimeType,

    sourceCharacterCount:
      draft.sourceCharacterCount,

    sourceWordCount:
      draft.sourceWordCount,

    sourcePageCount:
      draft.sourcePageCount,

    sourceMetadata:
      draft.sourceMetadata,

    generationMode:
      draft.generationMode,

    detectionMode:
      draft.detectionMode,

    status:
      draft.status,

    errorMessage:
      draft.errorMessage,

    createdAt:
      draft.createdAt,

    updatedAt:
      draft.updatedAt,
  };
}

async function importCourseMaterial(
  req,
  res
) {
  let temporaryFilePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Please upload a PDF, DOCX, XLSX or XLS file.",
      });
    }

    temporaryFilePath =
      req.file.path;

    const extracted =
      await extractDocument(
        temporaryFilePath,
        req.file.originalname
      );

    if (!extracted.text) {
      throw new Error(
        "No readable text was found in the uploaded document."
      );
    }

    const curriculum =
      detectCourseStructure(
        extracted.text
      );

    const modules =
      buildModules(
        curriculum
      );

    const practice =
      buildPractice(
        curriculum
      );

    const sourceSections =
      buildSourceSections(
        curriculum
      );

    const initialCourse =
      createInitialCourseData(
        req.file.originalname
      );

    const description =
      createCourseDescription(
        extracted.originalName,
        modules
      );

    const draft =
      await EducatorCourseDraft.create({
        title:
          initialCourse.title,

        category:
          initialCourse.category,

        level:
          initialCourse.level,

        description,

        duration:
          initialCourse.duration,

        language:
          initialCourse.language,

        features:
          initialCourse.features,

        modules,

        practice,

        sourceSections,

        summary:
          curriculum.summary || {},

        sourceFileName:
          extracted.originalName,

        sourceExtension:
          extracted.extension,

        sourceMimeType:
          extracted.mimeType,

        sourceCharacterCount:
          extracted.characterCount,

        sourceWordCount:
          extracted.wordCount,

        sourcePageCount:
          extracted.pageCount,

        sourceMetadata:
          extracted.metadata || {},

        generationMode:
          "RULE_BASED",

        detectionMode:
          curriculum.detectionMode || "",

        status:
          "READY_FOR_REVIEW",

        errorMessage:
          "",

        createdBy:
          req.user.userId,
      });

    return res.status(201).json({
      success: true,

      message:
        "Course material imported and course draft generated successfully.",

      draft:
        serializeDraft(draft),
    });
  } catch (error) {
    console.error(
      "Educator course material import error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Failed to import course material.",
    });
  } finally {
    if (temporaryFilePath) {
      try {
        await fs.unlink(
          temporaryFilePath
        );
      } catch (cleanupError) {
        if (
          cleanupError.code !==
          "ENOENT"
        ) {
          console.error(
            "Temporary course file cleanup error:",
            cleanupError
          );
        }
      }
    }
  }
}

module.exports = {
  importCourseMaterial,
};