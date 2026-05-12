const { connectDB } = require("../../../lib/db");
const { callGemini } = require("../../../lib/gemini");

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

    // Generate highlights using Gemini
    const systemPrompt =
      "You are a study assistant. Analyze the provided academic text and extract the most important points for exam preparation. Return a JSON array of highlights: [{ text: string, importance: 'high'|'medium', topic: string }]. High importance = likely to appear in exams. Return ONLY valid JSON, no markdown.";

    const response = await callGemini(systemPrompt, document.extractedText);

    // Parse JSON response
    let highlights;
    try {
      highlights = JSON.parse(response);
    } catch (parseError) {
      const jsonMatch =
        response.match(/```json\n([\s\S]*?)\n```/) ||
        response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        highlights = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response as JSON");
      }
    }

    // Save highlights to database
    const highlightRecord = {
      userId: new ObjectId(userId),
      documentId: new ObjectId(documentId),
      subjectId: document.subjectId,
      content: highlights,
      generatedAt: new Date(),
    };

    const result = await db.collection("highlights").insertOne(highlightRecord);
    highlightRecord._id = result.insertedId;

    res.status(200).json(highlights);
  } catch (error) {
    console.error("Highlights generation error:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to generate highlights" });
  }
}
