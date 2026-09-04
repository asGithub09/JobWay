const UNIT_PATTERN =
  /^(?:UNIT|MODULE|CHAPTER)\s*(?:[-:.\s]*)([IVXLCDM]+|\d+)?\s*$/i;

const NUMBERED_HEADING_PATTERN =
  /^(?:\d+(?:\.\d+)*|[IVXLCDM]+)[.)]?\s+[A-Z][A-Za-z0-9 ,:&'()/-]{2,120}$/;

const ALL_CAPS_HEADING_PATTERN =
  /^[A-Z][A-Z0-9 ,:&'()\/-]{3,120}$/;

const BULLET_PATTERN =
  /^(?:[•●▪◦‣–—*-]|\d+[.)])\s+/;

const QUESTION_ITEM_PATTERN =
  /^\((?:i{1,3}|iv|v|vi{0,3}|ix|x{1,3})\)\s+/i;

const MCQ_OPTION_PATTERN =
  /^\([a-d]\)\s+/i;

const TOP_LEVEL_NUMBER_PATTERN =
  /^\d+\.\s+/;

const PRACTICE_HEADINGS = new Set([
  "exercises",
  "exercise",
  "practice questions",
  "practice",
  "question bank",
  "questions",
  "mcqs",
]);

const PROJECT_HEADINGS = new Set([
  "project work",
  "project",
]);

/*
 * PDF extraction artifacts that must never
 * become curriculum headings.
 */
const IGNORED_HEADINGS = new Set([
  "h a p t e r",
  "chapter",
]);

const NON_CONTENT_LINES = [
  /^reprint\s+\d{4}(?:-\d{2})?$/i,
  /^--\s*\d+\s+of\s+\d+\s+--$/i,
];

function cleanLine(line) {
  return String(line || "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function normalizeText(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function isIgnoredHeading(line) {
  const clean = cleanLine(line).toLowerCase();

  if (IGNORED_HEADINGS.has(clean)) {
    return true;
  }

  /*
   * Handles PDF extraction where the word
   * CHAPTER has been split into individual letters.
   */
  const compact = clean.replace(/\s+/g, "");

  return (
    compact === "chapter" ||
    compact === "chapters"
  );
}

function isPageMarker(line) {
  const clean = cleanLine(line);

  return NON_CONTENT_LINES.some(
    (pattern) => pattern.test(clean),
  );
}

function isRunningHeader(line) {
  const clean = cleanLine(line);

  return (
    /^(GEOGRAPHY AS A DISCIPLINE|FUNDAMENTALS OF PHYSICAL GEOGRAPHY)\s+\d+$/i.test(
      clean,
    )
  );
}

function removeNoiseLines(lines) {
  const cleaned = [];

  for (const rawLine of lines) {
    const line = cleanLine(rawLine);

    if (!line) {
      continue;
    }

    if (isPageMarker(line)) {
      continue;
    }

    if (isRunningHeader(line)) {
      continue;
    }

    if (isIgnoredHeading(line)) {
      continue;
    }

    cleaned.push(line);
  }

  return cleaned;
}

function isBullet(line) {
  return BULLET_PATTERN.test(
    cleanLine(line),
  );
}

function isMcqOption(line) {
  return MCQ_OPTION_PATTERN.test(
    cleanLine(line),
  );
}

function isRomanQuestionItem(line) {
  return QUESTION_ITEM_PATTERN.test(
    cleanLine(line),
  );
}

function isTopLevelQuestion(line) {
  const clean = cleanLine(line);

  return (
    TOP_LEVEL_NUMBER_PATTERN.test(clean) &&
    clean.length > 4
  );
}

function isPracticeHeading(line) {
  return PRACTICE_HEADINGS.has(
    cleanLine(line).toLowerCase(),
  );
}

function isProjectHeading(line) {
  return PROJECT_HEADINGS.has(
    cleanLine(line).toLowerCase(),
  );
}

function isQuestionInstruction(line) {
  const clean = cleanLine(line).toLowerCase();

  return (
    clean.includes(
      "multiple choice questions",
    ) ||
    clean.includes(
      "answer the following questions",
    ) ||
    clean.includes(
      "answer the following",
    ) ||
    clean.includes(
      "choose the correct answer",
    ) ||
    clean.includes(
      "select the correct answer",
    )
  );
}

function isUnitHeading(line) {
  const clean = cleanLine(line);

  return (
    Boolean(clean) &&
    UNIT_PATTERN.test(clean)
  );
}

function isClearlyProse(line) {
  const clean = cleanLine(line);

  if (!clean) {
    return false;
  }

  if (
    isMcqOption(clean) ||
    isRomanQuestionItem(clean)
  ) {
    return true;
  }

  if (
    clean.endsWith(".") &&
    clean.length > 35
  ) {
    return true;
  }

  if (
    clean.includes(". ") &&
    clean.length > 45
  ) {
    return true;
  }

  if (
    /^(this|these|those|the|it|they|we|you|your|some|many|each|all|which|what|where|when|why|how|can|please)\b/i.test(
      clean,
    )
  ) {
    return true;
  }

  return false;
}

function looksLikeNumberedHeading(line) {
  const clean = cleanLine(line);

  if (!clean) {
    return false;
  }

  if (
    isIgnoredHeading(clean) ||
    isQuestionInstruction(clean) ||
    isMcqOption(clean) ||
    isRomanQuestionItem(clean) ||
    isClearlyProse(clean)
  ) {
    return false;
  }

  if (
    isPracticeHeading(clean) ||
    isProjectHeading(clean)
  ) {
    return false;
  }

  if (
    /^\d+\.\s+(?:multiple choice|answer the following|project work)/i.test(
      clean,
    )
  ) {
    return false;
  }

  return NUMBERED_HEADING_PATTERN.test(
    clean,
  );
}

function looksLikeAllCapsHeading(line) {
  const clean = cleanLine(line);

  if (
    !clean ||
    clean.length < 5 ||
    clean.length > 120
  ) {
    return false;
  }

  if (
    isIgnoredHeading(clean) ||
    isQuestionInstruction(clean) ||
    isMcqOption(clean) ||
    isRomanQuestionItem(clean) ||
    isClearlyProse(clean) ||
    isPracticeHeading(clean) ||
    isProjectHeading(clean)
  ) {
    return false;
  }

  if (
    /^(?:FIGURE|TABLE|REPRINT)\b/i.test(
      clean,
    )
  ) {
    return false;
  }

  if (
    !ALL_CAPS_HEADING_PATTERN.test(
      clean,
    )
  ) {
    return false;
  }

  const letters =
    clean.match(/[A-Za-z]/g) || [];

  const uppercaseLetters =
    clean.match(/[A-Z]/g) || [];

  if (!letters.length) {
    return false;
  }

  return (
    uppercaseLetters.length /
      letters.length >=
    0.8
  );
}

function getHeadingType(line) {
  if (isIgnoredHeading(line)) {
    return null;
  }

  if (isUnitHeading(line)) {
    return "unit";
  }

  if (isPracticeHeading(line)) {
    return "practice";
  }

  if (isProjectHeading(line)) {
    return "project";
  }

  if (looksLikeNumberedHeading(line)) {
    return "numbered";
  }

  if (looksLikeAllCapsHeading(line)) {
    return "heading";
  }

  return null;
}

function cleanHeading(line) {
  return cleanLine(line)
    .replace(
      /^(?:UNIT|MODULE|CHAPTER)\s*[-:.\s]*/i,
      "",
    )
    .replace(
      /^\d+(?:\.\d+)*[.)]?\s+/,
      "",
    )
    .replace(
      /^[IVXLCDM]+[.)]?\s+/i,
      "",
    )
    .trim();
}

function mergeBrokenHeadings(lines) {
  const merged = [];

  for (
    let index = 0;
    index < lines.length;
    index += 1
  ) {
    const current = cleanLine(
      lines[index],
    );

    const next = cleanLine(
      lines[index + 1],
    );

    if (!current) {
      continue;
    }

    if (isIgnoredHeading(current)) {
      continue;
    }

    if (
      current &&
      next &&
      !isIgnoredHeading(next) &&
      current.length > 15 &&
      !current.endsWith(".") &&
      !current.endsWith("?") &&
      /(?:ON|OF|BASED|REGIONAL|SYSTEMATIC)$/i.test(
        current,
      ) &&
      /^[A-Z][A-Z0-9 ,:&'()\/-]{2,80}$/.test(
        next,
      )
    ) {
      merged.push(
        `${current} ${next}`,
      );

      index += 1;
      continue;
    }

    merged.push(current);
  }

  return merged;
}

function prepareLines(text) {
  let lines =
    normalizeText(text)
      .split("\n")
      .map(cleanLine);

  lines =
    removeNoiseLines(lines);

  lines =
    mergeBrokenHeadings(lines);

  /*
   * A second cleanup pass guarantees that
   * artifacts created or exposed during merging
   * are removed before indexing.
   */
  lines =
    removeNoiseLines(lines);

  return lines;
}

function extractBullets(lines) {
  const bullets = [];

  for (const rawLine of lines) {
    const line = cleanLine(rawLine);

    if (!isBullet(line)) {
      continue;
    }

    const text = line
      .replace(
        /^(?:[•●▪◦‣–—*-]|\d+[.)])\s+/,
        "",
      )
      .trim();

    if (text) {
      bullets.push(text);
    }
  }

  return bullets;
}

function extractPracticeQuestions(
  lines,
) {
  const questions = [];

  let current = "";

  for (const rawLine of lines) {
    const line = cleanLine(rawLine);

    if (!line || isPageMarker(line)) {
      continue;
    }

    if (
      isQuestionInstruction(line)
    ) {
      continue;
    }

    if (
      isRomanQuestionItem(line)
    ) {
      if (current) {
        questions.push(
          current.trim(),
        );
      }

      current = line;
      continue;
    }

    if (
      current &&
      isMcqOption(line)
    ) {
      current += ` ${line}`;
      continue;
    }

    if (
      current &&
      line.endsWith("?")
    ) {
      current += ` ${line}`;

      questions.push(
        current.trim(),
      );

      current = "";
      continue;
    }

    if (current) {
      current += ` ${line}`;
    }
  }

  if (current) {
    questions.push(
      current.trim(),
    );
  }

  return questions.filter(
    (question) =>
      question.length >= 15,
  );
}

function extractMcqBlocks(lines) {
  const blocks = [];

  let current = null;

  for (const rawLine of lines) {
    const line = cleanLine(rawLine);

    if (!line) {
      continue;
    }

    if (
      isRomanQuestionItem(line)
    ) {
      if (current) {
        blocks.push(current);
      }

      current = {
        question: line,
        options: [],
      };

      continue;
    }

    if (
      current &&
      isMcqOption(line)
    ) {
      current.options.push(line);
    }
  }

  if (current) {
    blocks.push(current);
  }

  return blocks.filter(
    (block) =>
      block.options.length >= 2,
  );
}

function detectPracticeType(
  text,
) {
  const normalized =
    normalizeText(text);

  const lower =
    normalized.toLowerCase();

  if (
    lower.includes("project work") ||
    lower.includes("project")
  ) {
    return "project";
  }

  if (
    lower.includes(
      "multiple choice questions",
    ) ||
    lower.includes("mcqs")
  ) {
    return "mcq";
  }

  if (
    lower.includes("150 words") ||
    lower.includes("150 word")
  ) {
    return "long-answer";
  }

  if (
    lower.includes("30 words") ||
    lower.includes("30 word")
  ) {
    return "short-answer";
  }

  return "general";
}

function calculateHeadingConfidence(
  type,
) {
  if (type === "unit") {
    return 100;
  }

  if (type === "numbered") {
    return 90;
  }

  if (type === "heading") {
    return 85;
  }

  if (
    type === "practice" ||
    type === "project"
  ) {
    return 90;
  }

  return 70;
}

function detectHeadingsFromLines(
  lines,
) {
  const headings = [];

  lines.forEach(
    (line, index) => {
      if (!line) {
        return;
      }

      if (isIgnoredHeading(line)) {
        return;
      }

      const type =
        getHeadingType(line);

      if (!type) {
        return;
      }

      headings.push({
        index,
        originalText: line,
        title: cleanHeading(line),
        type,
        confidence:
          calculateHeadingConfidence(
            type,
          ),
      });
    },
  );

  return headings;
}

function detectHeadings(text) {
  const lines =
    prepareLines(text);

  return detectHeadingsFromLines(
    lines,
  );
}

function extractUnitsFromLines(
  lines,
  headings,
) {
  const unitHeadings =
    headings.filter(
      (heading) =>
        heading.type === "unit",
    );

  if (!unitHeadings.length) {
    return [
      {
        number: 1,
        sourceTitle:
          "Imported Material",
        title:
          "Imported Material",
        confidence: 50,
        startLine: -1,
        endLine: lines.length,
      },
    ];
  }

  return unitHeadings.map(
    (unitHeading, index) => {
      const start =
        unitHeading.index + 1;

      const end =
        index <
        unitHeadings.length - 1
          ? unitHeadings[
              index + 1
            ].index
          : lines.length;

      return {
        number: index + 1,
        sourceTitle:
          unitHeading.originalText,
        title:
          unitHeading.title ||
          `Unit ${index + 1}`,
        confidence:
          unitHeading.confidence,
        startLine:
          unitHeading.index,
        endLine: end,
      };
    },
  );
}

function extractUnits(
  text,
  headings,
) {
  const lines =
    prepareLines(text);

  const resolvedHeadings =
    headings ||
    detectHeadingsFromLines(
      lines,
    );

  return extractUnitsFromLines(
    lines,
    resolvedHeadings,
  );
}

function buildSections(
  lines,
  headings,
  startIndex,
  endIndex,
) {
  const localHeadings =
    headings.filter(
      (heading) =>
        heading.index >= startIndex &&
        heading.index < endIndex &&
        heading.type !== "unit" &&
        !isIgnoredHeading(
          heading.originalText,
        ),
    );

  return localHeadings.map(
    (heading, index) => {
      const sectionStart =
        heading.index + 1;

      const sectionEnd =
        index <
        localHeadings.length - 1
          ? localHeadings[
              index + 1
            ].index
          : endIndex;

      const sectionLines =
        lines.slice(
          sectionStart,
          sectionEnd,
        );

      const isPractice =
        heading.type ===
        "practice";

      const isProject =
        heading.type ===
        "project";

      const sectionText =
        sectionLines
          .join("\n")
          .trim();

      return {
        title:
          heading.title,

        sourceTitle:
          heading.originalText,

        type:
          heading.type,

        confidence:
          heading.confidence,

        startLine:
          heading.index,

        endLine:
          sectionEnd,

        isPractice,

        isProject,

        practiceType:
          isProject
            ? "project"
            : isPractice
              ? detectPracticeType(
                  sectionText,
                )
              : null,

        bullets:
          extractBullets(
            sectionLines,
          ),

        questions:
          isPractice
            ? extractPracticeQuestions(
                sectionLines,
              )
            : [],

        mcqBlocks:
          isPractice
            ? extractMcqBlocks(
                sectionLines,
              )
            : [],

        text: sectionText,
      };
    },
  );
}

function buildCurriculum(text) {
  /*
   * IMPORTANT:
   * This is the only line preparation step.
   * Every subsequent operation uses this exact
   * same array, keeping indexes aligned.
   */
  const lines =
    prepareLines(text);

  const headings =
    detectHeadingsFromLines(
      lines,
    );

  const units =
    extractUnitsFromLines(
      lines,
      headings,
    );

  const curriculumUnits =
    units.map(
      (unit, unitIndex) => {
        const nextUnit =
          units[unitIndex + 1];

        const startIndex =
          unit.startLine === -1
            ? 0
            : unit.startLine + 1;

        const endIndex =
          nextUnit &&
          nextUnit.startLine >= 0
            ? nextUnit.startLine
            : lines.length;

        return {
          ...unit,

          sections:
            buildSections(
              lines,
              headings,
              startIndex,
              endIndex,
            ),
        };
      },
    );

  return {
    detectionMode:
      curriculumUnits.length
        ? "unit-based"
        : "heading-based",

    units:
      curriculumUnits,
  };
}

function summarizeStructure(
  curriculum,
) {
  const units =
    curriculum?.units || [];

  let sectionCount = 0;
  let questionCount = 0;
  let bulletCount = 0;
  let mcqCount = 0;

  for (const unit of units) {
    sectionCount +=
      unit.sections?.length || 0;

    for (const section of
      unit.sections || []) {
      bulletCount +=
        section.bullets?.length || 0;

      if (section.isPractice) {
        questionCount +=
          section.questions?.length || 0;

        mcqCount +=
          section.mcqBlocks?.length || 0;
      }
    }
  }

  return {
    unitCount:
      units.length,

    sectionCount,

    questionCount,

    bulletCount,

    mcqCount,
  };
}

function detectCourseStructure(
  text,
) {
  if (!normalizeText(text)) {
    throw new Error(
      "Source text is required for structure detection.",
    );
  }

  const curriculum =
    buildCurriculum(text);

  return {
    ...curriculum,

    summary:
      summarizeStructure(
        curriculum,
      ),
  };
}

module.exports = {
  detectCourseStructure,
  detectHeadings,
  extractUnits,
  extractBullets,
  extractPracticeQuestions,
  extractMcqBlocks,
  detectPracticeType,
  buildCurriculum,
  summarizeStructure,
  normalizeText,
  isPageMarker,
  isRunningHeader,
  isPracticeHeading,
  isProjectHeading,
};