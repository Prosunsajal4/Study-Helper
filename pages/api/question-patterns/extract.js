const { connectDB } = require("../../../lib/db");
const { callGemini } = require("../../../lib/gemini");
const { extractExamPatternWithGemini } = require("../../../lib/examPattern");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { documentId } = req.body;
    const ObjectId = require("mongodb").ObjectId;

    if (!documentId) {
      return res.status(400).json({ error: "documentId is required" });
    }

    const db = await connectDB();

    // Get document and verify ownership
    const document = await db.collection("documents").findOne({
      _id: new ObjectId(documentId),
      userId: new ObjectId(userId),
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    if (document.docType !== "question_pattern") {
      return res
        .status(400)
        .json({ error: "Document must be a question pattern" });
    }

    // Extract patterns using Gemini
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

    const response = await callGemini(systemPrompt, document.extractedText);

    // Parse JSON response
    let patternData;
    try {
      patternData = JSON.parse(response);
    } catch (parseError) {
      const jsonMatch =
        response.match(/```json\n([\s\S]*?)\n```/) ||
        response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        patternData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        throw new Error("Failed to parse pattern extraction response");
      }
    }

    // Save pattern to database
    const patternRecord = {
      userId: new ObjectId(userId),
      documentId: new ObjectId(documentId),
      subjectId: document.subjectId,
      patternText: document.extractedText,
      extractedPattern: patternData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Upsert - update if exists, insert if not
    await db
      .collection("questionPatterns")
      .updateOne(
        { documentId: new ObjectId(documentId), userId: new ObjectId(userId) },
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
