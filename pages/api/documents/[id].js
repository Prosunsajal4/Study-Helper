const { connectDB, getDB } = require("../../../lib/db");
const fs = require("fs");
const path = require("path");

export default async function handler(req, res) {
  const { id } = req.query;
  const ObjectId = require("mongodb").ObjectId;

  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const db = await connectDB();

    if (req.method === "GET") {
      const document = await db.collection("documents").findOne({
        _id: new ObjectId(id),
        userId: new ObjectId(userId),
      });

      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      // Get highlights for this document
      const highlights = await db
        .collection("highlights")
        .find({ documentId: new ObjectId(id), userId: new ObjectId(userId) })
        .toArray();

      // Get questions for this document
      const questions = await db
        .collection("questions")
        .find({ documentIds: new ObjectId(id), userId: new ObjectId(userId) })
        .toArray();

      res.status(200).json({
        ...document,
        highlights,
        questions,
      });
    } else if (req.method === "DELETE") {
      const document = await db.collection("documents").findOne({
        _id: new ObjectId(id),
        userId: new ObjectId(userId),
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
        .deleteMany({
          documentId: new ObjectId(id),
          userId: new ObjectId(userId),
        });

      // Delete associated questions
      await db
        .collection("questions")
        .deleteMany({
          documentIds: new ObjectId(id),
          userId: new ObjectId(userId),
        });

      // Delete document from database
      await db
        .collection("documents")
        .deleteOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });

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
