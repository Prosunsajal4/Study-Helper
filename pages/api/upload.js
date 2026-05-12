const { connectDB, getDB } = require("../../lib/db");
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
  dest: "public/uploads/",
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
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
    // Check authentication
    const userId = req.headers["x-user-id"];
    console.log("Upload request - userId:", userId);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - No userId header" });
    }

    await runMiddleware(req, res, upload.single("file"));

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { subjectId, docType } = req.body;
    console.log("Upload request - subjectId:", subjectId, "docType:", docType);

    if (!subjectId || !docType) {
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

    // Verify subject exists and belongs to user
    console.log("Looking for subject with _id:", subjectId, "userId:", userId);
    const subject = await db
      .collection("subjects")
      .findOne({ _id: new ObjectId(subjectId), userId: new ObjectId(userId) });
    console.log("Found subject:", subject);
    if (!subject) {
      fs.unlinkSync(req.file.path);
      return res
        .status(404)
        .json({ error: "Subject not found or does not belong to you" });
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
      "public/uploads",
      `${Date.now()}-${originalName}`,
    );
    fs.renameSync(req.file.path, finalPath);

    // Save document to database
    const document = {
      userId: new ObjectId(userId),
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
        const systemPrompt = `You are an exam pattern analyzer. Analyze the provided question paper and extract the question pattern structure. 
Return a JSON object with this exact structure:
{
  "patterns": [
    {
      "section": "Section A/B/C etc",
      "questionType": "MCQ/Short Answer/Long Answer/ etc",
      "marksPerQuestion": number,
      "totalQuestions": number,
      "topics": ["topic1", "topic2"],
      "difficulty": "easy/medium/hard"
    }
  ],
  "totalMarks": number,
  "examDuration": "duration in minutes or hours",
  "commonTopics": ["topic1", "topic2"],
  "questionDistribution": {
    "easy": percentage,
    "medium": percentage,
    "hard": percentage
  }
}

Return ONLY valid JSON, no markdown.`;
        const response = await callGemini(systemPrompt, extractedText);
        let patternData;
        try {
          patternData = JSON.parse(response);
        } catch (parseError) {
          const jsonMatch =
            response.match(/```json\n([\s\S]*?)\n```/) ||
            response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            patternData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          }
        }

        if (patternData) {
          await db.collection("questionPatterns").insertOne({
            userId: new ObjectId(userId),
            documentId: new ObjectId(result.insertedId),
            subjectId: new ObjectId(subjectId),
            patternText: extractedText,
            extractedPattern: patternData,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          patternExtracted = true;
        }
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

    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ error: error.message || "Upload failed" });
  }
}
