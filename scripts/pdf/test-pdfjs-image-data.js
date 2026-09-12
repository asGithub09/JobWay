const fs = require("fs");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.mjs");

const filePath = "C:\\Users\\AKASH\\Desktop\\NCERT-Class-10-Political-Science.pdf";

(async () => {
  const data = new Uint8Array(fs.readFileSync(filePath));

  const pdf = await pdfjsLib.getDocument({
    data,
    useWorkerFetch: false,
    isEvalSupported: false,
  }).promise;

  console.log("Pages:", pdf.numPages);

  for (let pageNumber = 1; pageNumber <= 3; pageNumber++) {
    const page = await pdf.getPage(pageNumber);

    console.log(`\n========== PAGE ${pageNumber} ==========`);

    const operatorList = await page.getOperatorList();

    for (let i = 0; i < operatorList.fnArray.length; i++) {
      const fn = operatorList.fnArray[i];

      if (
        fn === pdfjsLib.OPS.paintImageXObject ||
        fn === pdfjsLib.OPS.paintInlineImageXObject ||
        fn === pdfjsLib.OPS.paintImageMaskXObject ||
        fn === pdfjsLib.OPS.paintImageMaskXObjectRepeat
      ) {
        const args = operatorList.argsArray[i];

        console.log("IMAGE OPERATION");
        console.log("fn:", fn);
        console.dir(args, {
          depth: 2,
          maxArrayLength: 10,
        });
      }
    }

    page.cleanup();
  }

  await pdf.destroy();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
