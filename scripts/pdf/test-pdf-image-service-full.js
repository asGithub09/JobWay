const { extractPdfImages } = require("./src/services/pdfImageService");

const filePath =
  "C:\\Users\\AKASH\\Desktop\\NCERT-Class-10-Political-Science.pdf";

(async () => {
  console.time("FULL PDF IMAGE EXTRACTION");

  const images = await extractPdfImages(filePath);

  console.timeEnd("FULL PDF IMAGE EXTRACTION");

  console.log("\n========== RESULT ==========");
  console.log("Useful unique images:", images.length);

  console.log("\n========== FIRST 10 ==========");

  images.slice(0, 10).forEach((image, index) => {
    console.log({
      index: index + 1,
      pageNumber: image.pageNumber,
      width: image.width,
      height: image.height,
      pngBytes: image.buffer?.length || 0,
      hash: image.hash,
      sourceType: image.sourceType,
    });
  });
})().catch((error) => {
  console.error("\nFULL IMAGE EXTRACTION FAILED");
  console.error(error);
  process.exit(1);
});
