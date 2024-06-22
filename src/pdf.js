const PdfPrinter = require("pdfmake");
const fs = require("fs");
const stream = require("stream");

const fontDir = "public/assets/fonts";

const fonts = {
    Noto_Sans: {
        normal: `${fontDir}/noto_sans/static/NotoSansSC-Regular.ttf`,
        bold: `${fontDir}/noto_sans/static/NotoSansSC-Bold.ttf`,
        italics: `${fontDir}/noto_sans/static/NotoSansSC-Italic.ttf`,
        bolditalics: `${fontDir}/noto_sans/static/NotoSansSC-BoldItalic.ttf`,
    },
}

const printer = new PdfPrinter(fonts);

function getDocDefinition() { 
    return {
  content: [
    {
      style: "tableExample",
      table: {
        widths: ["*", "*", "*", "*"],
        body: [["Item", "Description", "Retail"]],
      },
    },
  ],
  defaultStyle: {
    font: "Noto_Sans",
  },
};
}

async function createPDF(items, type) {
    let docDefinition = getDocDefinition();
    //console.log(items, type);
  if (type === "Wholesale") {
    docDefinition.content[0].table.body[0].push("Wholesale");
    items.forEach((item) => {
      if(!item.error){
      docDefinition.content[0].table.body.push([
        item.id,
        item.description,
        item.retail,
        item.wholesale,
      ]);
    }else {
      console.log("Item not found.")
    }
    });
  } else if (type === "Cost") {
    
    docDefinition.content[0].table.body[0].push("Cost")
    items.forEach((item) => {
      docDefinition.content[0].table.body.push([
        item.id,
        item.description,
        item.retail,
        item.cost,
      ]);
    });
    //console.log(docDefinition);
  }
  console.log(JSON.stringify(docDefinition))
  var pdfDoc = printer.createPdfKitDocument(docDefinition);
  const pdfStream = new stream.PassThrough();
  pdfDoc.pipe(pdfStream);

  return new Promise((resolve, reject) => {
    pdfDoc.on("end", () => {
        resolve(pdfStream);
        });
    pdfDoc.on("error", reject);
    pdfDoc.end();
  });
}

module.exports = { createPDF };
