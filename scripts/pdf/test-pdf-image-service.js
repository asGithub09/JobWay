const fs = require("fs");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.mjs");

const filePath =
  "C:\\Users\\AKASH\\Desktop\\NCERT-Class-10-Political-Science.pdf";

function getObject(page, id, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    let finished = false;

    const timer = setTimeout(() => {
      if (!finished) {
        finished = true;
        reject(
          new Error(`Timed out resolving PDF object: ${id}`)
        );
      }
    }, timeoutMs);

    try {
      page.objs.get(id, (image) => {
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

(async () => {
  console.log("1. Reading PDF...");
  const data = new Uint8Array(fs.readFileSync(filePath));

  console.log("2. Loading PDF...");
  const pdf = await pdfjsLib.getDocument({
    data,
    useWorkerFetch: false,
    isEvalSupported: false,
  }).promise;

  console.log("3. PDF loaded:", pdf.numPages, "pages");

  const page = await pdf.getPage(1);

  console.log("4. Page 1 loaded");

  const operatorList = await page.getOperatorList();

  console.log(
    "5. Operator count:",
    operatorList.fnArray.length
  );

  for (let i = 0; i < operatorList.fnArray.length; i++) {
    const fn = operatorList.fnArray[i];

    if (fn !== pdfjsLib.OPS.paintImageXObject) {
      continue;
    }

    console.log("6. Found paintImageXObject at:", i);

    const args = operatorList.argsArray[i];

    console.log("7. Arguments:", args);

    const imageId = args?.[0];

    if (!imageId) {
      console.log("8. No image ID.");
      continue;
    }

    console.log("9. Resolving:", imageId);

    const image = await getObject(
      page,
      imageId,
      10000
    );

    console.log("10. Image resolved.");

    console.log({
      width: image?.width,
      height: image?.height,
      kind: image?.kind,
      dataType: image?.data?.constructor?.name,
      dataLength: image?.data?.length,
    });

    break;
  }

  console.log("11. Cleaning up...");
  page.cleanup();

  await pdf.destroy();

  console.log("12. COMPLETE");
})().catch((error) => {
  console.error("\nDIAGNOSTIC FAILED:");
  console.error(error);
  process.exit(1);
});
