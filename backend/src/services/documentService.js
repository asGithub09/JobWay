const fs = require("fs/promises");
const path = require("path");
const mammoth = require("mammoth");
const { PDFParse } = require("pdf-parse");

const SUPPORTED_EXTENSIONS = new Set([
  ".pdf",
  ".docx",
]);

function normalizeText(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getExtension(fileName) {
  return path
    .extname(fileName || "")
    .toLowerCase();
}

async function extractPdf(filePath) {
  const buffer = await fs.readFile(filePath);

  const parser = new PDFParse({
    data: buffer,
  });

  try {
    const result = await parser.getText();

    const text = normalizeText(
      result.text,
    );

    return {
      text,
      pageCount: Number(
        result.total || 0,
      ),
      metadata: {},
    };
  } finally {
    await parser.destroy();
  }
}

async function extractDocx(filePath) {
  const result =
    await mammoth.extractRawText({
      path: filePath,
    });

  const text = normalizeText(
    result.value,
  );

  return {
    text,
    pageCount: 0,
    metadata: {},
    messages:
      result.messages || [],
  };
}

async function extractDocument(
  filePath,
  originalName = "",
) {
  if (!filePath) {
    throw new Error(
      "Document file path is required.",
    );
  }

  const extension = getExtension(
    originalName || filePath,
  );

  if (
    !SUPPORTED_EXTENSIONS.has(
      extension,
    )
  ) {
    throw new Error(
      `Unsupported document type: ${
        extension || "unknown"
      }. Supported types: PDF and DOCX.`,
    );
  }

  let extracted;

  if (extension === ".pdf") {
    extracted =
      await extractPdf(filePath);
  } else {
    extracted =
      await extractDocx(filePath);
  }

  if (!extracted.text) {
    throw new Error(
      "No readable text was found in the uploaded document.",
    );
  }

  const words =
    extracted.text
      .split(/\s+/)
      .filter(Boolean);

  return {
    originalName:
      originalName ||
      path.basename(filePath),

    extension,

    mimeType:
      extension === ".pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    text: extracted.text,

    pageCount:
      extracted.pageCount,

    metadata:
      extracted.metadata,

    messages:
      extracted.messages || [],

    characterCount:
      extracted.text.length,

    wordCount:
      words.length,
  };
}

module.exports = {
  extractDocument,
  normalizeText,
  getExtension,
  SUPPORTED_EXTENSIONS,
};