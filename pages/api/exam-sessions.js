const { connectDB } = require("../../lib/db");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { subjectId, examType, title, selectedQuestionIds } = req.body;

    if (!subjectId || !examType || !title || !selectedQuestionIds) {
      return res.status(400).json({
        error:
          "subjectId, examType, title, and selectedQuestionIds are required",
      });
    }

    const db = await connectDB();
    const ObjectId = require("mongodb").ObjectId;

    // Get selected questions
    const questionIds = selectedQuestionIds.map((id) => new ObjectId(id));
    const questionRecords = await db
      .collection("questions")
      .find({ _id: { $in: questionIds } })
      .toArray();

    // Compile all questions into a single set
    const compiledQuestions = [];
    questionRecords.forEach((record) => {
      compiledQuestions.push(...record.questions);
    });

    const examSession = {
      subjectId: new ObjectId(subjectId),
      examType,
      title,
      questions: compiledQuestions,
      createdAt: new Date(),
    };

    const result = await db.collection("examSessions").insertOne(examSession);
    examSession._id = result.insertedId;

    res.status(201).json(examSession);
  } catch (error) {
    console.error("Exam session creation error:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to create exam session" });
  }
}
