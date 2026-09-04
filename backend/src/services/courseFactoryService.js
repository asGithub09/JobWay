const Course = require("../models/Course");
const CourseMaterial = require("../models/CourseMaterial");
const CourseDraft = require("../models/CourseDraft");

const {
  extractDocument,
} = require("./documentService");

const {
  detectCourseStructure,
} = require("./courseStructureService");

function cleanText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateText(value, maxLength) {
  const text = cleanText(value);

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3).trim()}...`;
}

function capitalizeTitle(value) {
  const text = cleanText(value);

  if (!text) {
    return "Untitled Lesson";
  }

  return text
    .toLowerCase()
    .split(" ")
    .map((word) => {
      if (!word) {
        return word;
      }

      return (
        word.charAt(0).toUpperCase() +
        word.slice(1)
      );
    })
    .join(" ");
}

function buildLessonDescription(section) {
  const text = cleanText(section.text);

  if (!text) {
    return `Study the topic "${section.title}" from the source material.`;
  }

  return truncateText(text, 500);
}

function buildLessonContent(section) {
  const text = String(section.text || "").trim();

  if (text) {
    return text;
  }

  return `This lesson covers ${section.title}.`;
}

function buildKeyPoints(section) {
  const points = [];

  for (const bullet of section.bullets || []) {
    const cleaned = cleanText(bullet);

    if (cleaned) {
      points.push(cleaned);
    }
  }

  /*
   * If the source contains no bullet points,
   * create a small deterministic key-point
   * representation from the first sentences.
   */
  if (!points.length && section.text) {
    const sentences =
      String(section.text)
        .replace(/\s+/g, " ")
        .split(/(?<=[.!?])\s+/)
        .map(cleanText)
        .filter(
          (sentence) =>
            sentence.length >= 20,
        );

    for (
      const sentence of sentences.slice(
        0,
        5,
      )
    ) {
      points.push(
        truncateText(sentence, 220),
      );
    }
  }

  return points.slice(0, 10);
}

function buildLesson(section, order) {
  return {
    title: capitalizeTitle(
      section.title,
    ),

    description:
      buildLessonDescription(
        section,
      ),

    content:
      buildLessonContent(
        section,
      ),

    keyPoints:
      buildKeyPoints(section),

    bullets:
      (section.bullets || [])
        .map(cleanText)
        .filter(Boolean),

    sourceSection:
      section.sourceTitle ||
      section.title,

    order,
  };
}

function buildModules(curriculum) {
  const modules = [];

  let moduleOrder = 0;

  for (const unit of curriculum.units || []) {
    const normalSections =
      (unit.sections || []).filter(
        (section) =>
          !section.isPractice &&
          !section.isProject,
      );

    /*
     * Each detected unit becomes a module
     * when it contains multiple sections.
     */
    if (normalSections.length) {
      moduleOrder += 1;

      const lessons =
        normalSections.map(
          (section, index) =>
            buildLesson(
              section,
              index + 1,
            ),
        );

      modules.push({
        title:
          unit.title ||
          `Module ${moduleOrder}`,

        description:
          `Study the topics covered in ${unit.title || "this module"}.`,

        order: moduleOrder,

        lessons,
      });
    }
  }

  /*
   * If the document has no explicit units,
   * create a module from all normal sections.
   */
  if (!modules.length) {
    const allSections = [];

    for (const unit of
      curriculum.units || []) {
      for (const section of
        unit.sections || []) {
        if (
          !section.isPractice &&
          !section.isProject
        ) {
          allSections.push(section);
        }
      }
    }

    if (allSections.length) {
      modules.push({
        title: "Course Content",

        description:
          "Automatically generated course content from the uploaded source material.",

        order: 1,

        lessons:
          allSections.map(
            (section, index) =>
              buildLesson(
                section,
                index + 1,
              ),
          ),
      });
    }
  }

  return modules;
}

function normalizeMcqQuestion(
  block,
  sectionTitle,
  order,
) {
  return {
    question:
      cleanText(
        block.question,
      ),

    options:
      (block.options || [])
        .map(cleanText)
        .filter(Boolean),

    type: "mcq",

    sourceSection:
      sectionTitle,

    order,
  };
}

function normalizePracticeQuestion(
  question,
  type,
  sectionTitle,
  order,
) {
  let text = cleanText(question);

  const options = [];

  const optionMatches =
    text.match(
      /\([a-d]\)\s+.*?(?=\s+\([a-d]\)\s+|$)/gi,
    ) || [];

  if (optionMatches.length) {
    for (const option of optionMatches) {
      options.push(
        cleanText(
          option,
        ),
      );
    }

    text = cleanText(
      text.replace(
        /\([a-d]\)\s+.*?(?=\s+\([a-d]\)\s+|$)/gi,
        "",
      ),
    );
  }

  return {
    question: text,

    options,

    type,

    sourceSection:
      sectionTitle,

    order,
  };
}

function buildPractice(curriculum) {
  const practice = [];

  let practiceOrder = 0;

  function splitMcqOptions(options = []) {
    const combined = options
      .map(cleanText)
      .filter(Boolean)
      .join(" ");

    if (!combined) {
      return [];
    }

    const matches = combined.match(
      /\([a-d]\)\s*[\s\S]*?(?=\s+\([a-d]\)|$)/gi,
    );

    if (matches && matches.length > 0) {
      return matches.map((option) =>
        cleanText(option),
      );
    }

    return options
      .map(cleanText)
      .filter(Boolean);
  }

  function cleanQuestionPrefix(question) {
    return cleanText(question).replace(
      /^\s*\([ivxlcdm]+\)\s*/i,
      "",
    );
  }

  function addPracticeBlock({
    title,
    type,
    description,
    questions,
  }) {
    if (!questions.length) {
      return;
    }

    practiceOrder += 1;

    practice.push({
      title,
      type,
      description,
      questions,
      order: practiceOrder,
    });
  }

  for (const unit of curriculum.units || []) {
    for (const section of unit.sections || []) {
      if (
        !section.isPractice &&
        !section.isProject
      ) {
        continue;
      }

      if (section.isProject) {
        const questions = [];

        for (
          const [
            index,
            question,
          ] of (
            section.questions || []
          ).entries()
        ) {
          const normalized =
            normalizePracticeQuestion(
              question,
              "project",
              section.title,
              index + 1,
            );

          if (normalized.question) {
            questions.push({
              ...normalized,
              question:
                cleanQuestionPrefix(
                  normalized.question,
                ),
            });
          }
        }

        if (
          !questions.length &&
          cleanText(section.text)
        ) {
          questions.push({
            question: cleanText(
              section.text,
            ),
            options: [],
            type: "project",
            sourceSection:
              section.title,
            order: 1,
          });
        }

        addPracticeBlock({
          title: section.title,
          type: "project",
          description:
            "Project work extracted from the source material.",
          questions,
        });

        continue;
      }

      const mcqQuestions = [];

      for (
        const [
          index,
          block,
        ] of (
          section.mcqBlocks || []
        ).entries()
      ) {
        const normalized =
          normalizeMcqQuestion(
            block,
            section.title,
            index + 1,
          );

        const question =
          cleanQuestionPrefix(
            normalized.question,
          );

        const options =
          splitMcqOptions(
            normalized.options || [],
          );

        if (question) {
          mcqQuestions.push({
            ...normalized,
            question,
            options,
            order: index + 1,
          });
        }
      }

      addPracticeBlock({
        title: `${section.title} - Multiple Choice Questions`,
        type: "mcq",
        description:
          `Multiple choice questions extracted from ${section.title}.`,
        questions: mcqQuestions,
      });

      const sourceText =
        cleanText(section.text);

      const shortAnswerQuestions = [];

      const shortStart =
        sourceText.search(
          /2\.\s*Answer the following questions in about 30 words\./i,
        );

      const longStart =
        sourceText.search(
          /3\.\s*Answer the following questions in about 150 words\./i,
        );

      if (shortStart !== -1) {
        const shortEnd =
          longStart !== -1
            ? longStart
            : sourceText.length;

        const shortText =
          sourceText.slice(
            shortStart,
            shortEnd,
          );

        const questionMatches =
          shortText.match(
            /\([ivxlcdm]+\)\s+[\s\S]*?(?=\s+\([ivxlcdm]+\)\s+|$)/gi,
          ) || [];

        for (
          const [
            index,
            question,
          ] of questionMatches.entries()
        ) {
          const cleaned =
            cleanQuestionPrefix(
              question,
            );

          if (cleaned) {
            shortAnswerQuestions.push({
              question: cleaned,
              options: [],
              type: "short-answer",
              sourceSection:
                section.title,
              order: index + 1,
            });
          }
        }
      }

      addPracticeBlock({
        title: `${section.title} - Short Answer Questions`,
        type: "short-answer",
        description:
          `Short-answer questions extracted from ${section.title}.`,
        questions:
          shortAnswerQuestions,
      });

      const longAnswerQuestions = [];

      if (longStart !== -1) {
        const longText =
          sourceText.slice(
            longStart,
          );

        const questionMatches =
          longText.match(
            /\([ivxlcdm]+\)\s+[\s\S]*?(?=\s+\([ivxlcdm]+\)\s+|$)/gi,
          ) || [];

        for (
          const [
            index,
            question,
          ] of questionMatches.entries()
        ) {
          const cleaned =
            cleanQuestionPrefix(
              question,
            );

          if (cleaned) {
            longAnswerQuestions.push({
              question: cleaned,
              options: [],
              type: "long-answer",
              sourceSection:
                section.title,
              order: index + 1,
            });
          }
        }
      }

      addPracticeBlock({
        title: `${section.title} - Long Answer Questions`,
        type: "long-answer",
        description:
          `Long-answer questions extracted from ${section.title}.`,
        questions:
          longAnswerQuestions,
      });

      if (
        !mcqQuestions.length &&
        !shortAnswerQuestions.length &&
        !longAnswerQuestions.length &&
        (section.questions || []).length
      ) {
        const generalQuestions = [];

        for (
          const [
            index,
            question,
          ] of (
            section.questions || []
          ).entries()
        ) {
          const normalized =
            normalizePracticeQuestion(
              question,
              "general",
              section.title,
              index + 1,
            );

          const cleaned =
            cleanQuestionPrefix(
              normalized.question,
            );

          if (cleaned) {
            generalQuestions.push({
              ...normalized,
              question: cleaned,
              options: [],
              type: "general",
              order: index + 1,
            });
          }
        }

        addPracticeBlock({
          title: `${section.title} - Practice Questions`,
          type: "general",
          description:
            `Practice questions extracted from ${section.title}.`,
          questions:
            generalQuestions,
        });
      }
    }
  }

  return practice;
}

function buildSourceSections(
  curriculum,
) {
  const sections = [];

  let order = 0;

  for (const unit of curriculum.units || []) {
    for (const section of
      unit.sections || []) {
      order += 1;

      sections.push({
        title:
          section.title,

        sourceTitle:
          section.sourceTitle ||
          section.title,

        type:
          section.type ||
          "heading",

        confidence:
          Number(
            section.confidence || 0,
          ),

        isPractice:
          Boolean(
            section.isPractice,
          ),

        isProject:
          Boolean(
            section.isProject,
          ),

        practiceType:
          section.practiceType ||
          "",

        text:
          section.text || "",

        order,
      });
    }
  }

  return sections;
}

function buildCourseDescription(
  course,
  material,
  curriculum,
) {
  if (
    cleanText(
      course?.description,
    )
  ) {
    return course.description;
  }

  const sectionTitles = [];

  for (const unit of
    curriculum.units || []) {
    for (const section of
      unit.sections || []) {
      if (
        !section.isPractice &&
        !section.isProject
      ) {
        sectionTitles.push(
          section.title,
        );
      }
    }
  }

  const topics =
    sectionTitles
      .slice(0, 8)
      .map(cleanText)
      .filter(Boolean);

  if (topics.length) {
    return (
      `This course has been generated from ${material.originalName || "uploaded study material"}. ` +
      `It covers ${topics.join(", ")}.`
    );
  }

  return `Course draft generated from ${material.originalName || "uploaded study material"}.`;
}

async function createCourseDraft({
  courseId,
  materialId,
  userId,
}) {
  if (!courseId) {
    throw new Error(
      "Course ID is required.",
    );
  }

  if (!materialId) {
    throw new Error(
      "Course material ID is required.",
    );
  }

  if (!userId) {
    throw new Error(
      "User ID is required.",
    );
  }

  const course =
    await Course.findById(
      courseId,
    );

  if (!course) {
    throw new Error(
      "Course not found.",
    );
  }

  const material =
    await CourseMaterial.findById(
      materialId,
    );

  if (!material) {
    throw new Error(
      "Course material not found.",
    );
  }

  if (
    material.course.toString() !==
    course._id.toString()
  ) {
    throw new Error(
      "Course material does not belong to the selected course.",
    );
  }

  let sourceText =
    material.extractedText;

  /*
   * Normally extractedText is already
   * stored by the upload process.
   *
   * If it is missing, attempt to re-extract
   * from the stored local file.
   */
  if (!cleanText(sourceText)) {
    if (
      material.storageProvider !==
      "local"
    ) {
      throw new Error(
        "Extracted text is unavailable for this material.",
      );
    }

    const uploadRoot =
      require("path").join(
        __dirname,
        "../../uploads",
      );

    const filePath =
      require("path").join(
        uploadRoot,
        material.fileName,
      );

    const extracted =
      await extractDocument(
        filePath,
        material.originalName,
      );

    sourceText =
      extracted.text;

    material.extractedText =
      extracted.text;

    material.pageCount =
      extracted.pageCount;

    material.characterCount =
      extracted.characterCount;

    material.wordCount =
      extracted.wordCount;

    await material.save();
  }

  if (!cleanText(sourceText)) {
    throw new Error(
      "No readable source text is available for this material.",
    );
  }

  const curriculum =
    detectCourseStructure(
      sourceText,
    );

  const modules =
    buildModules(
      curriculum,
    );

  const practice =
    buildPractice(
      curriculum,
    );

  const sourceSections =
    buildSourceSections(
      curriculum,
    );

  const description =
    buildCourseDescription(
      course,
      material,
      curriculum,
    );

  const draft =
    await CourseDraft.create({
      course:
        course._id,

      material:
        material._id,

      createdBy:
        userId,

      title:
        course.title,

      description,

      sourceFileName:
        material.originalName,

      status:
        "READY_FOR_REVIEW",

      generationMode:
        "rule-based",

      detectionMode:
        curriculum.detectionMode,

      summary:
        curriculum.summary ||
        {
          unitCount: 0,
          sectionCount: 0,
          questionCount: 0,
          bulletCount: 0,
          mcqCount: 0,
        },

      modules,

      practice,

      sourceSections,

      errorMessage: "",
    });

  return draft;
}

function sanitizeDraft(draft) {
  if (!draft) {
    return null;
  }

  return {
    id:
      draft._id.toString(),

    course:
      draft.course?.toString() ||
      draft.course,

    material:
      draft.material?.toString() ||
      draft.material,

    createdBy:
      draft.createdBy?.toString() ||
      draft.createdBy,

    title:
      draft.title,

    description:
      draft.description,

    sourceFileName:
      draft.sourceFileName,

    status:
      draft.status,

    generationMode:
      draft.generationMode,

    detectionMode:
      draft.detectionMode,

    summary:
      draft.summary,

    modules:
      draft.modules,

    practice:
      draft.practice,

    sourceSections:
      draft.sourceSections,

    errorMessage:
      draft.errorMessage,

    createdAt:
      draft.createdAt,

    updatedAt:
      draft.updatedAt,
  };
}

module.exports = {
  createCourseDraft,
  sanitizeDraft,
  buildModules,
  buildPractice,
  buildSourceSections,
  buildCourseDescription,
};