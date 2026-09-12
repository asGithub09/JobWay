const fs = require("fs");
const { PDFParse } = require("pdf-parse");

const filePath = "C:\\Users\\AKASH\\Desktop\\NCERT-Class-10-Political-Science.pdf";

(async () => {
  console.log("1. Reading PDF...");
  const buffer = fs.readFileSync(filePath);

  console.log("2. Creating parser...");
  const parser = new PDFParse({ data: buffer });

  try {
    console.log("3. Calling getImage()...");

    const result = await Promise.race([
      parser.getImage({
        imageThreshold: 0,
        imageBuffer: true,
        imageDataUrl: false,
      }),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("getImage() timed out after 30 seconds")),
          30000
        )
      ),
    ]);

    console.log("4. getImage() completed.");

    console.log("Result type:", typeof result);
    console.log("Result keys:", Object.keys(result || {}));
    console.log("Pages:", result?.pages?.length || 0);

    for (const page of result?.pages || []) {
      console.log(
        `Page ${page.pageNumber ?? page.page ?? "?"}: ${page.images?.length || 0} images`
      );
    }
  } finally {
    console.log("5. Destroying parser...");
    await parser.destroy();
    console.log("6. Done.");
  }
})().catch((error) => {
  console.error("\nIMAGE EXTRACTION ERROR:");
  console.error(error);
  process.exit(1);
});
