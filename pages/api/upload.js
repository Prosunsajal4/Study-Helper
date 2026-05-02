const { connectDB } = require("../../lib/db");
const { parseFile } = require("../../lib/parseFile");
const { callGemini } = require("../../lib/gemini");
const { extractExamPatternWithGemini } = require("../../lib/examPattern");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".pdf", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and DOCX files are allowed"));
    }
  },
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await runMiddleware(req, res, upload.single("file"));

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { subjectId, docType } = req.body;

    if (!subjectId || !docType) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res
        .status(400)
        .json({ error: "subjectId and docType are required" });
    }

    const validDocTypes = ["study_material", "question_pattern", "textbook"];
    if (!validDocTypes.includes(docType)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Invalid document type" });
    }

    const db = await connectDB();
    const ObjectId = require("mongodb").ObjectId;

    // Verify subject exists
    const subject = await db
      .collection("subjects")
      .findOne({ _id: new ObjectId(subjectId) });
    if (!subject) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: "Subject not found" });
    }

    // Parse file
    const fileType = path
      .extname(req.file.originalname)
      .toLowerCase()
      .substring(1);
    const extractedText = await parseFile(req.file.path, fileType);

    // Create final file path with original name
    const originalName = req.file.originalname;
    const finalPath = path.join(
      uploadDir,
      `${Date.now()}-${originalName}`,
    );
    fs.renameSync(req.file.path, finalPath);

    // Save document to database
    const document = {
      subjectId: new ObjectId(subjectId),
      fileName: originalName,
      fileType,
      filePath: finalPath,
      extractedText,
      uploadedAt: new Date(),
      docType,
    };

    const result = await db.collection("documents").insertOne(document);
    document._id = result.insertedId;

    // Auto-extract pattern if document is a question pattern
    let patternExtracted = false;
    if (docType === "question_pattern") {
      try {
        const patternData = await extractExamPatternWithGemini(
          extractedText,
          callGemini,
        );
        await db.collection("questionPatterns").insertOne({
          documentId: new ObjectId(result.insertedId),
          subjectId: new ObjectId(subjectId),
          patternText: extractedText,
          extractedPattern: patternData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        patternExtracted = true;
      } catch (patternError) {
        console.error("Auto pattern extraction failed:", patternError);
      }
    }

    res.status(201).json({
      documentId: document._id.toString(),
      fileName: document.fileName,
      extractedTextPreview: extractedText.substring(0, 500),
      patternExtracted,
    });
  } catch (error) {
    console.error("Upload error:", error);

    // Clean up uploaded file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ error: error.message || "Upload failed" });
  }
}
