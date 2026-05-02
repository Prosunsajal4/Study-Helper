const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const fs = require("fs");

async function parseFile(filePath, fileType) {
  try {
    if (!filePath) {
      throw new Error("File path is required");
    }

    if (!fs.existsSync(filePath)) {
      throw new Error("File does not exist at the specified path");
    }

    if (fileType === "pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text || "";
    } else if (fileType === "docx") {
      const dataBuffer = fs.readFileSync(filePath);
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      return result.value || "";
    } else {
      throw new Error(
        `Unsupported file type: ${fileType}. Only PDF and DOCX are supported.`,
      );
    }
  } catch (error) {
    console.error("Error parsing file:", error);
    throw new Error(`Failed to parse file: ${error.message}`);
  }
}

module.exports = { parseFile };
