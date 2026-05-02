const { connectDB } = require("../../../lib/db");
const { callGemini } = require("../../../lib/gemini");
const { extractExamPatternWithGemini } = require("../../../lib/examPattern");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { documentId } = req.body;
    const ObjectId = require("mongodb").ObjectId;

    if (!documentId) {
      return res.status(400).json({ error: "documentId is required" });
    }

    const db = await connectDB();

    const document = await db.collection("documents").findOne({
      _id: new ObjectId(documentId),
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    if (document.docType !== "question_pattern") {
      return res
        .status(400)
        .json({ error: "Document must be a question_pattern" });
    }

    const patternData = await extractExamPatternWithGemini(
      document.extractedText,
      callGemini,
    );

    const patternRecord = {
      documentId: new ObjectId(documentId),
      subjectId: document.subjectId,
      patternText: document.extractedText,
      extractedPattern: patternData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("questionPatterns").updateOne(
      { documentId: new ObjectId(documentId) },
      { $set: patternRecord },
      { upsert: true },
    );

    res.status(200).json({
      message: "Pattern extracted successfully",
      pattern: patternData,
    });
  } catch (error) {
    console.error("Pattern extraction error:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to extract pattern" });
  }
}
