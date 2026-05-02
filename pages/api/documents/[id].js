const { connectDB, getDB } = require("../../../lib/db");
const fs = require("fs");
const path = require("path");

export default async function handler(req, res) {
  const { id } = req.query;
  const ObjectId = require("mongodb").ObjectId;

  try {
    const db = await connectDB();

    if (req.method === "GET") {
      const document = await db.collection("documents").findOne({
        _id: new ObjectId(id),
      });

      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      // Get highlights for this document
      const highlights = await db
        .collection("highlights")
        .find({ documentId: new ObjectId(id) })
        .toArray();

      // Question sets store source documents on `documentIds` (see /api/questions/generate)
      const questions = await db
        .collection("questions")
        .find({ documentIds: new ObjectId(id) })
        .toArray();

      res.status(200).json({
        ...document,
        highlights,
        questions,
      });
    } else if (req.method === "DELETE") {
      const document = await db.collection("documents").findOne({
        _id: new ObjectId(id),
      });

      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      // Delete file from filesystem
      if (document.filePath && fs.existsSync(document.filePath)) {
        fs.unlinkSync(document.filePath);
      }

      // Delete associated highlights
      await db
        .collection("highlights")
        .deleteMany({ documentId: new ObjectId(id) });

      await db
        .collection("questions")
        .deleteMany({ documentIds: new ObjectId(id) });

      await db
        .collection("questionPatterns")
        .deleteMany({ documentId: new ObjectId(id) });

      // Delete document from database
      await db.collection("documents").deleteOne({ _id: new ObjectId(id) });

      res.status(200).json({ message: "Document deleted successfully" });
    } else {
      res.setHeader("Allow", ["GET", "DELETE"]);
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error("Document detail API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
