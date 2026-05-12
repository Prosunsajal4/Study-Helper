const { connectDB } = require("../../lib/db");

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const db = await connectDB();
    const { subjectId, examType } = req.query;
    const ObjectId = require("mongodb").ObjectId;

    let query = { userId: new ObjectId(userId) };
    if (subjectId) {
      query.subjectId = new ObjectId(subjectId);
    }
    if (examType) {
      query.examType = examType;
    }

    const questions = await db
      .collection("questions")
      .find(query)
      .sort({ generatedAt: -1 })
      .toArray();

    res.status(200).json(questions);
  } catch (error) {
    console.error("Questions API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
