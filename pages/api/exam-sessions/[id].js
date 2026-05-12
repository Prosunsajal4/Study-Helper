const { connectDB } = require("../../../lib/db");

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const db = await connectDB();
    const ObjectId = require("mongodb").ObjectId;

    const examSession = await db.collection("examSessions").findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });

    if (!examSession) {
      return res.status(404).json({ error: "Exam session not found" });
    }

    // Get subject name
    const subject = await db.collection("subjects").findOne({
      _id: examSession.subjectId,
      userId: new ObjectId(userId),
    });

    res.status(200).json({
      ...examSession,
      subjectName: subject ? subject.name : "Unknown",
    });
  } catch (error) {
    console.error("Exam session detail error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
