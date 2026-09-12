const fs = require("fs");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.mjs");

const filePath = "C:\\Users\\AKASH\\Desktop\\NCERT-Class-10-Political-Science.pdf";

(async () => {
  console.log("Reading PDF...");

  const data = new Uint8Array(fs.readFileSync(filePath));

  const loadingTask = pdfjsLib.getDocument({
    data,
    useWorkerFetch: false,
    isEvalSupported: false,
  });

  const pdf = await loadingTask.promise;

  console.log("Pages:", pdf.numPages);

  let totalImages = 0;

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);

    const operatorList = await page.getOperatorList();

    let pageImages = 0;

    for (let i = 0; i < operatorList.fnArray.length; i++) {
      const fn = operatorList.fnArray[i];

      if (
        fn === pdfjsLib.OPS.paintImageMaskXObject ||
        fn === pdfjsLib.OPS.paintImageMaskXObjectRepeat ||
        fn === pdfjsLib.OPS.paintImageXObject ||
        fn === pdfjsLib.OPS.paintInlineImageXObject
      ) {
        pageImages++;
      }
    }

    if (pageImages > 0) {
      console.log(`Page ${pageNumber}: ${pageImages} image operation(s)`);
      totalImages += pageImages;
    }

    page.cleanup();

    if (pageNumber % 10 === 0) {
      console.log(`Processed ${pageNumber}/${pdf.numPages} pages...`);
    }
  }

  console.log("\n========== RESULT ==========");
  console.log("Total image operations:", totalImages);

  await pdf.destroy();
})().catch((error) => {
  console.error("\nPDF.JS IMAGE TEST FAILED");
  console.error(error);
  process.exit(1);
});
