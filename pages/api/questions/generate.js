const { connectDB } = require("../../../lib/db");
const { callGemini } = require("../../../lib/gemini");
const {
  buildBlueprintPromptBlock,
  resolveCtMarkTotal,
  resolveTermMarkTotal,
} = require("../../../lib/examPattern");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { documentIds, examType } = req.body;

    if (
      !documentIds ||
      !Array.isArray(documentIds) ||
      documentIds.length === 0
    ) {
      return res.status(400).json({ error: "documentIds array is required" });
    }

    if (!examType) {
      return res.status(400).json({ error: "examType is required" });
    }

    if (!["ct", "term"].includes(examType)) {
      return res.status(400).json({ error: 'examType must be "ct" or "term"' });
    }

    const db = await connectDB();
    const ObjectId = require("mongodb").ObjectId;

    // Get all documents
    const documents = await db
      .collection("documents")
      .find({
        _id: { $in: documentIds.map((id) => new ObjectId(id)) },
      })
      .toArray();

    if (documents.length === 0) {
      return res.status(404).json({ error: "No documents found" });
    }

    const subjectKey = String(documents[0].subjectId);
    for (const d of documents) {
      if (String(d.subjectId) !== subjectKey) {
        return res.status(400).json({
          error:
            "All selected documents must belong to the same subject. Question patterns from another subject will not be mixed in.",
        });
      }
    }

    const subjectObjectId = new ObjectId(subjectKey);

    const patternSourceDocs = await db
      .collection("documents")
      .find({
        subjectId: subjectObjectId,
        docType: "question_pattern",
      })
      .project({ _id: 1 })
      .toArray();

    const patternDocumentIds = patternSourceDocs.map((d) => d._id);

    const questionPatterns =
      patternDocumentIds.length === 0
        ? []
        : await db
            .collection("questionPatterns")
            .find({
              subjectId: subjectObjectId,
              documentId: { $in: patternDocumentIds },
            })
            .sort({ updatedAt: -1 })
            .toArray();

    let patternInfo = "";
    let extractedPattern = null;
    if (questionPatterns.length > 0) {
      const pattern =
        questionPatterns.find(
          (p) =>
            p.extractedPattern &&
            ((Array.isArray(p.extractedPattern.patterns) &&
              p.extractedPattern.patterns.length > 0) ||
              (Array.isArray(p.extractedPattern.ctSection?.patterns) &&
                p.extractedPattern.ctSection.patterns.length > 0) ||
              (Array.isArray(p.extractedPattern.termSection?.patterns) &&
                p.extractedPattern.termSection.patterns.length > 0)),
        ) || questionPatterns[0];

      if (pattern.extractedPattern) {
        extractedPattern = pattern.extractedPattern;
        patternInfo = buildBlueprintPromptBlock(extractedPattern, examType);
      } else {
        patternInfo = `PREVIOUS QUESTION PAPER:\n${questionPatterns.map((p) => p.patternText).join("\n\n")}`;
      }
    }

    const combinedText = documents
      .map((doc) => `--- Document: ${doc.fileName} ---\n${doc.extractedText}`)
      .join("\n\n");

    const ctMarkTotal = extractedPattern
      ? resolveCtMarkTotal(extractedPattern)
      : 30;
    const termMarkTotal = extractedPattern
      ? resolveTermMarkTotal(extractedPattern)
      : null;

    let prompt = "";
    if (examType === "ct") {
      prompt = `You are writing a **CLASS TEST (CT)** from the study materials below.

Hard rules:
1) The **sum of the "marks" field** over every question in your output must equal **exactly ${ctMarkTotal}** (integer marks only; no rounding error—adjust count and per-question marks until the sum is ${ctMarkTotal}).
2) Use the **CT / class-test** blueprint below. If the blueprint separates CT from term, follow **only** the CT portion for style and weighting—do not output term-style 10-mark essays unless the CT blueprint clearly uses them.
3) Include a mix of **MCQ** and **short answer** as implied by the blueprint. If the blueprint marks mathematics / numerical work for CT, or the subject content is quantitative, include **at least one** question that needs clear **mathematical or numerical working** (calculation, formula, or numeric reasoning).
4) Each item needs a specific **answer** suitable for marking.

Study materials:
${combinedText}`;
    } else {
      const rule1 =
        termMarkTotal != null
          ? `1) The **sum of the "marks" field** over all questions must equal **exactly ${termMarkTotal}** (integer marks; adjust until the sum matches).`
          : `1) Choose a realistic full-paper total (about **75–100 marks** unless the blueprint states otherwise). The sum of all "marks" must equal that total exactly.`;

      prompt = `You are writing a **TERM / FINAL** exam from the study materials below.

Hard rules:
${rule1}
2) Follow the **TERM / final** portion of the blueprint (long answer, application, subdivisions as printed). Do **not** collapse the paper into CT-style micro-MCQs unless the blueprint is purely objective.
3) If the blueprint or subject expects **mathematics**, include multiple questions with derivations, proofs, or substantial numerical work as appropriate.
4) Each question needs a full **model answer**.

Study materials:
${combinedText}`;
    }

    if (patternInfo) {
      prompt += `\n\n--- BLUEPRINT (learned from uploaded question pattern) ---\n${patternInfo}--- END BLUEPRINT ---\n`;
    }

    const systemPrompt =
      "You are a study assistant that generates exam questions. Return a JSON object with this exact structure: { questions: [{ question: string, answer: string, marks: number, type: 'short'|'long'|'mcq' }] }. Return ONLY valid JSON, no markdown. Every marks value must be a positive integer.";

    const response = await callGemini(systemPrompt, prompt, {
      temperature: 0.35,
      maxOutputTokens: 8192,
    });

    // Parse JSON response
    let questionsData;
    try {
      questionsData = JSON.parse(response);
    } catch (parseError) {
      const jsonMatch =
        response.match(/```json\n([\s\S]*?)\n```/) ||
        response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        questionsData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response as JSON");
      }
    }

    // Save questions to database
    const questionRecord = {
      documentIds: documentIds.map((id) => new ObjectId(id)),
      subjectId: documents[0].subjectId,
      examType,
      questions: questionsData.questions,
      generatedAt: new Date(),
    };

    const result = await db.collection("questions").insertOne(questionRecord);
    questionRecord._id = result.insertedId;

    res.status(200).json(questionsData.questions);
  } catch (error) {
    console.error("Questions generation error:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to generate questions" });
  }
}
