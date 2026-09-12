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

  const page = await pdf.getPage(1);
  const operatorList = await page.getOperatorList();

  console.log("Page 1 loaded.");

  for (let i = 0; i < operatorList.fnArray.length; i++) {
    const fn = operatorList.fnArray[i];

    if (fn === pdfjsLib.OPS.paintImageXObject) {
      const args = operatorList.argsArray[i];
      const imageId = args[0];

      console.log("Image ID:", imageId);

      const image = await new Promise((resolve, reject) => {
        page.objs.get(imageId, resolve);
      });

      console.log("\n========== RESOLVED IMAGE ==========");
      console.log("Keys:", Object.keys(image || {}));
      console.log("Width:", image?.width);
      console.log("Height:", image?.height);
      console.log("Kind:", image?.kind);
      console.log("Data type:", image?.data?.constructor?.name);
      console.log(
        "Data length:",
        image?.data?.length || 0
      );
    }
  }

  page.cleanup();
  await pdf.destroy();
})().catch((error) => {
  console.error("\nIMAGE RESOLUTION FAILED");
  console.error(error);
  process.exit(1);
});
