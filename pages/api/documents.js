const { connectDB } = require("../../lib/db");

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const db = await connectDB();
    const { subjectId, docType, omitDocTypes } = req.query;
    const ObjectId = require("mongodb").ObjectId;

    let query = {};
    if (subjectId) {
      query.subjectId = new ObjectId(subjectId);
    }
    if (docType) {
      query.docType = docType;
    } else if (omitDocTypes) {
      const parts = String(omitDocTypes)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (parts.length === 1) {
        query.docType = { $ne: parts[0] };
      } else if (parts.length > 1) {
        query.docType = { $nin: parts };
      }
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
