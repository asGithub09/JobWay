const fs = require("fs/promises");
const path = require("path");
const mammoth = require("mammoth");
const { PDFParse } = require("pdf-parse");
const XLSX = require("xlsx");

const SUPPORTED_EXTENSIONS = new Set([
  ".pdf",
  ".docx",
  ".xlsx",
  ".xls",
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

    // Preserve the PDF parser output as-is.
    // Do not normalize whitespace here because the PDF content
    // must remain faithful to the extracted source material.
    const text = String(result.text || "");

    return {
      text,
      pageCount: Number(result.total || 0),
      metadata: {},
    };
  } finally {
    await parser.destroy();
  }
}

async function extractDocx(filePath) {
  const result = await mammoth.extractRawText({
    path: filePath,
  });

  const text = normalizeText(result.value);

  return {
    text,
    pageCount: 0,
    metadata: {},
    messages: result.messages || [],
  };
}

function normalizeExcelHeader(value) {
  return String(value ?? "")
    .replace(/\r\n/g, " ")
    .replace(/\r/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function makeUniqueHeader(header, usedHeaders) {
  const baseHeader =
    normalizeExcelHeader(header) || "Column";

  let finalHeader = baseHeader;
  let counter = 2;

  while (usedHeaders.has(finalHeader)) {
    finalHeader = `${baseHeader} ${counter}`;
    counter += 1;
  }

  usedHeaders.add(finalHeader);

  return finalHeader;
}
function convertSheetToObjects(rows) {
  if (!Array.isArray(rows) || !rows.length) {
    return [];
  }

  /*
   * Find the actual question-bank header row.
   *
   * Teachers may have:
   * - a title row
   * - instructions
   * - blank rows
   * before the real column headers.
   *
   * We therefore search for the row containing
   * "Question" instead of assuming row 1 is the header.
   */
  const headerIndex = rows.findIndex((row) => {
    if (!Array.isArray(row)) {
      return false;
    }

    const normalized = row.map((value) =>
      normalizeExcelHeader(value).toLowerCase()
    );

    const hasQuestion =
      normalized.includes("question") ||
      normalized.includes("question text");

    const hasOptionA =
      normalized.includes("option a") ||
      normalized.includes("a");

    const hasOptionB =
      normalized.includes("option b") ||
      normalized.includes("b");

    return (
      hasQuestion &&
      hasOptionA &&
      hasOptionB
    );
  });

  if (headerIndex === -1) {
    return [];
  }

  const headerRow = rows[headerIndex];

  const usedHeaders = new Set();

  const headers = headerRow.map((header) =>
    makeUniqueHeader(
      header,
      usedHeaders
    )
  );

  return rows
    .slice(headerIndex + 1)
    .map((row) => {
      if (!Array.isArray(row)) {
        return null;
      }

      const object = {};

      headers.forEach((header, index) => {
        object[header] = String(
          row[index] ?? ""
        ).trim();
      });

      const hasData =
        Object.values(object).some(
          (value) =>
            String(value).trim() !== ""
        );

      return hasData ? object : null;
    })
    .filter(Boolean);
}

async function extractExcel(filePath) {
  const workbook = XLSX.readFile(filePath, {
    cellDates: true,
    cellNF: false,
    cellStyles: false,
  });

  const sections = [];
  const allRows = [];

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      continue;
    }

    const rows = XLSX.utils.sheet_to_json(
      worksheet,
      {
        header: 1,
        defval: "",
        raw: false,
        blankrows: false,
      }
    );

    if (!rows.length) {
      continue;
    }

    const sheetRows = convertSheetToObjects(rows);

    allRows.push(
      ...sheetRows.map((row) => ({
        ...row,
        __sheetName: sheetName,
      }))
    );

    const lines = [];

    lines.push(`Sheet: ${sheetName}`);
    lines.push("");

    for (const row of rows) {
      const values = row.map((value) =>
        String(value ?? "").trim()
      );

      const nonEmptyValues =
        values.filter(Boolean);

      if (!nonEmptyValues.length) {
        continue;
      }

      lines.push(
        nonEmptyValues.join(" | ")
      );
    }

    if (lines.length > 2) {
      sections.push(
        lines.join("\n")
      );
    }
  }

  const text = normalizeText(
    sections.join("\n\n")
  );

  return {
    text,

    rows: allRows,

    pageCount:
      workbook.SheetNames.length,

    metadata: {
      sheetCount:
        workbook.SheetNames.length,

      sheetNames:
        workbook.SheetNames,
    },
  };
}

function getMimeType(extension) {
  switch (extension) {
    case ".pdf":
      return "application/pdf";

    case ".docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    case ".xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    case ".xls":
      return "application/vnd.ms-excel";

    default:
      return "application/octet-stream";
  }
}

async function extractDocument(
  filePath,
  originalName = ""
) {
  if (!filePath) {
    throw new Error(
      "Document file path is required."
    );
  }

  const extension = getExtension(
    originalName || filePath
  );

  if (
    !SUPPORTED_EXTENSIONS.has(extension)
  ) {
    throw new Error(
      `Unsupported document type: ${
        extension || "unknown"
      }. Supported types: PDF, DOCX, XLSX and XLS.`
    );
  }

  let extracted;

  if (extension === ".pdf") {
    extracted =
      await extractPdf(filePath);
  } else if (extension === ".docx") {
    extracted =
      await extractDocx(filePath);
  } else {
    extracted =
      await extractExcel(filePath);
  }

  if (!extracted.text) {
    throw new Error(
      "No readable text was found in the uploaded document."
    );
  }

  const words = extracted.text
    .split(/\s+/)
    .filter(Boolean);

  return {
    originalName:
      originalName ||
      path.basename(filePath),

    extension,

    mimeType:
      getMimeType(extension),

    text:
      extracted.text,

    rows:
      extracted.rows || [],

    pageCount:
      extracted.pageCount,

    metadata:
      extracted.metadata || {},

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
