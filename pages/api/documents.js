const { connectDB, getDB } = require("../../lib/db");

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const db = await connectDB();
    const { subjectId, docType } = req.query;
    const ObjectId = require("mongodb").ObjectId;

    let query = { userId: req.user._id };
    if (subjectId) {
      query.subjectId = new ObjectId(subjectId);
    }
    if (docType) {
      query.docType = docType;
    }

    const documents = await db
      .collection("documents")
      .find(query)
      .sort({ uploadedAt: -1 })
      .toArray();

    res.status(200).json(documents);
  } catch (error) {
    console.error("Documents API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
