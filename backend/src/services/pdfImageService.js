const fs = require("fs/promises");
const crypto = require("crypto");
const { PNG } = require("pngjs");

const MIN_WIDTH = 60;
const MIN_HEIGHT = 60;
const MIN_AREA = 10000;
const OBJECT_TIMEOUT_MS = 1000;

let pdfjsPromise;

function getPdfJs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist/legacy/build/pdf.mjs");
  }

  return pdfjsPromise;
}

function waitForPageObject(
  page,
  objectId,
  timeoutMs = OBJECT_TIMEOUT_MS,
) {
  return new Promise((resolve, reject) => {
    let finished = false;

    const timer = setTimeout(() => {
      if (finished) return;

      finished = true;
      reject(
        new Error(
          `Timed out resolving PDF image object: ${objectId}`,
        ),
      );
    }, timeoutMs);

    try {
      page.objs.get(objectId, (image) => {
        if (finished) return;

        finished = true;
        clearTimeout(timer);
        resolve(image);
      });
    } catch (error) {
      if (finished) return;

      finished = true;
      clearTimeout(timer);
      reject(error);
    }
  });
}

function isUsefulImage(image) {
  const width = Number(image?.width || 0);
  const height = Number(image?.height || 0);

  return (
    width >= MIN_WIDTH &&
    height >= MIN_HEIGHT &&
    width * height >= MIN_AREA
  );
}

function encodePng(image) {
  const width = Number(image?.width || 0);
  const height = Number(image?.height || 0);
  const kind = Number(image?.kind);

  if (!width || !height || !image?.data) {
    return null;
  }

  const source = Buffer.from(image.data);

  let colorType;

  // PDF.js ImageKind:
  // 2 = RGB_24BPP
  // 3 = RGBA_32BPP
  if (
    kind === 2 &&
    source.length === width * height * 3
  ) {
    colorType = 2;
  } else if (
    kind === 3 &&
    source.length === width * height * 4
  ) {
    colorType = 6;
  } else {
    return null;
  }

  const png = new PNG({
    width,
    height,
    colorType,
  });

  source.copy(png.data);

  return new Promise((resolve, reject) => {
    const chunks = [];

    png.on("data", (chunk) => {
      chunks.push(chunk);
    });

    png.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    png.on("error", reject);

    png.pack();
  });
}

async function extractPdfImages(filePath) {
  const buffer = await fs.readFile(filePath);
  const pdfjsLib = await getPdfJs();

  const pdf = await pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
    isEvalSupported: false,
  }).promise;

  const images = [];
  const seenHashes = new Set();

  try {
    for (
      let pageNumber = 1;
      pageNumber <= pdf.numPages;
      pageNumber += 1
    ) {
      const page = await pdf.getPage(pageNumber);

      try {
        const operatorList =
          await page.getOperatorList();

        for (
          let index = 0;
          index < operatorList.fnArray.length;
          index += 1
        ) {
          const fn = operatorList.fnArray[index];

          const isImageObject =
            fn ===
              pdfjsLib.OPS.paintImageXObject ||
            fn ===
              pdfjsLib.OPS.paintInlineImageXObject;

          if (!isImageObject) {
            continue;
          }

          const args =
            operatorList.argsArray[index];

          if (!args) {
            continue;
          }

          const objectId = args[0];

          if (typeof objectId !== "string") {
            continue;
          }

          let image;

          try {
            image =
              await waitForPageObject(
                page,
                objectId,
              );
          } catch (error) {
            console.warn(
              `Skipping PDF image object ${objectId} on page ${pageNumber}:`,
              error.message,
            );
            continue;
          }

          if (!isUsefulImage(image)) {
            continue;
          }

          let pngBuffer;

          try {
            pngBuffer =
              await encodePng(image);
          } catch (error) {
            console.warn(
              `Skipping PDF image ${objectId} on page ${pageNumber}:`,
              error.message,
            );
            continue;
          }

          if (!pngBuffer) {
            continue;
          }

          const hash =
            crypto
              .createHash("sha256")
              .update(pngBuffer)
              .digest("hex");

          if (seenHashes.has(hash)) {
            continue;
          }

          seenHashes.add(hash);

          images.push({
            pageNumber,
            width: Number(image.width),
            height: Number(image.height),
            buffer: pngBuffer,
            hash,
            sourceType:
              "PDF_EMBEDDED_IMAGE",
          });
        }
      } finally {
        page.cleanup();
      }
    }

    return images;
  } finally {
    await pdf.destroy();
  }
}

module.exports = {
  extractPdfImages,
};

