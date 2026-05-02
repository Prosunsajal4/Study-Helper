/**
 * Shared exam / question-paper pattern extraction for uploads and manual extract.
 * PDF→text is often messy (columns, headers); we use a strict prompt, clipped input,
 * low temperature, JSON-only mode, and resilient parsing.
 */

const MAX_PATTERN_INPUT_CHARS = 200_000;
const HEAD_CHARS = 160_000;
const TAIL_CHARS = 40_000;

const EXAM_PATTERN_SYSTEM_PROMPT = `You are an expert exam secretary. You read raw text extracted from a PDF or Word question paper or blueprint (OCR/layout may be imperfect).

Your job is to split what you can infer into TWO logical parts when the source material distinguishes them:
- **Class test / CT / unit test / short internal assessment** (shorter, lower total marks, often MCQ + brief)
- **Term / semester / final / board-style exam** (longer questions, higher total marks, long answer)

Rules:
1) Base every field on what the document actually says. If something is not stated, use null for numbers, [] for arrays, empty patterns arrays, or "unspecified" for short text—do not invent exact marks unless clearly printed.
2) Copy section/part labels exactly as they appear (e.g. "PART-A", "CT", "Unit Test 1", "Semester II").
3) If the paper clearly prints **only one** exam type, put details in that section's patterns and leave the other section's patterns as [] and explain in extractionNotes.
4) If CT and term are on the same PDF but different sections, put CT blocks only under ctSection and term blocks only under termSection.
5) For each section row, set requiresMathematics true only if that part explicitly has numeric/calculation/derivation/math-type questions or says "Mathematics" / quantitative problems.
6) internalChoice: describe "answer any k of n" when visible.
7) ctSection.totalMarks / termSection.totalMarks: use the printed total for that part only when visible (e.g. "CT – 30 Marks"); else null.
8) Output must be a single JSON object only—no markdown, no commentary.

JSON shape (all top-level keys required):
{
  "ctSection": {
    "patterns": [
      {
        "section": "string",
        "questionType": "string",
        "marksPerQuestion": null,
        "totalQuestions": null,
        "topics": [],
        "difficulty": "easy" | "medium" | "hard" | "unspecified",
        "internalChoice": null,
        "requiresMathematics": true | false | null
      }
    ],
    "totalMarks": null,
    "requiresMathematics": true | false | null,
    "description": "string — how CT is organized on this paper"
  },
  "termSection": {
    "patterns": [ same object shape as in ctSection.patterns ],
    "totalMarks": null,
    "requiresMathematics": true | false | null,
    "description": "string — how term/final is organized"
  },
  "patterns": [],
  "totalMarks": null,
  "examDuration": "string",
  "commonTopics": [],
  "questionDistribution": { "easy": null, "medium": null, "hard": null },
  "extractionNotes": "string"
}

Use "patterns" only for rows that apply to the whole paper or cannot be split; prefer filling ctSection and termSection when the source splits CT vs term.`;

function clipPaperText(text) {
  if (!text || typeof text !== "string") return "";
  if (text.length <= MAX_PATTERN_INPUT_CHARS) return text;
  return (
    text.slice(0, HEAD_CHARS) +
    "\n\n[... middle of document omitted for length ...]\n\n" +
    text.slice(-TAIL_CHARS)
  );
}

function extractFirstJsonObject(str) {
  const start = str.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < str.length; i++) {
    const c = str[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (inString) {
      if (c === "\\") escaped = true;
      else if (c === '"') inString = false;
      continue;
    }
    if (c === '"') {
      inString = true;
      continue;
    }
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return str.slice(start, i + 1);
    }
  }
  return null;
}

function parseModelPatternJson(raw) {
  if (raw == null) throw new Error("Empty pattern extraction response");
  const t = String(raw).trim();
  try {
    return JSON.parse(t);
  } catch {
    /* continue */
  }
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) {
    try {
      return JSON.parse(fence[1].trim());
    } catch {
      /* continue */
    }
  }
  const blob = extractFirstJsonObject(t);
  if (blob) {
    try {
      return JSON.parse(blob);
    } catch {
      /* continue */
    }
  }
  throw new Error("Failed to parse pattern extraction as JSON");
}

function ensureSectionShape(sec) {
  if (!sec || typeof sec !== "object") {
    return {
      patterns: [],
      totalMarks: null,
      requiresMathematics: null,
      description: "",
    };
  }
  if (!Array.isArray(sec.patterns)) sec.patterns = [];
  for (const p of sec.patterns) {
    if (p && typeof p === "object") {
      if (p.internalChoice === undefined) p.internalChoice = null;
      if (p.requiresMathematics === undefined) p.requiresMathematics = null;
    }
  }
  if (sec.description === undefined || sec.description === null) {
    sec.description = "";
  }
  return sec;
}

function normalizePatternData(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Pattern data is not an object");
  }
  data.ctSection = ensureSectionShape(data.ctSection);
  data.termSection = ensureSectionShape(data.termSection);
  if (!Array.isArray(data.patterns)) {
    data.patterns = [];
  }
  for (const p of data.patterns) {
    if (p && typeof p === "object" && p.internalChoice === undefined) {
      p.internalChoice = null;
    }
  }
  if (data.extractionNotes === undefined || data.extractionNotes === null) {
    data.extractionNotes = "";
  }
  if (!data.questionDistribution || typeof data.questionDistribution !== "object") {
    data.questionDistribution = { easy: null, medium: null, hard: null };
  }
  if (!Array.isArray(data.commonTopics)) {
    data.commonTopics = [];
  }
  return data;
}

function formatPatternRows(rows, label) {
  if (!Array.isArray(rows) || rows.length === 0) return "";
  let s = `${label}:\n`;
  rows.forEach((p, i) => {
    const choice =
      p.internalChoice != null && String(p.internalChoice).trim()
        ? `, internal choice: ${p.internalChoice}`
        : "";
    const math =
      p.requiresMathematics === true
        ? ", includes math/numerical work"
        : "";
    s += `  - ${p.section || `Block ${i + 1}`}: ${p.questionType || "unspecified"}, ${p.marksPerQuestion ?? "?"} marks each, ${p.totalQuestions ?? "?"} questions, topics: ${(p.topics || []).join(", ") || "—"}${choice}${math}\n`;
  });
  return s;
}

/**
 * Build human-readable blueprint text for question generation.
 * @param {object} ep - extractedPattern
 * @param {"ct"|"term"} examType
 */
function buildBlueprintPromptBlock(ep, examType) {
  if (!ep || typeof ep !== "object") return "";

  const ct = ep.ctSection || {};
  const term = ep.termSection || {};
  let block = "";

  if (examType === "ct") {
    const rows =
      Array.isArray(ct.patterns) && ct.patterns.length > 0
        ? ct.patterns
        : ep.patterns || [];
    block += formatPatternRows(rows, "CLASS TEST (CT) STRUCTURE TO FOLLOW");
    if (ct.totalMarks != null && Number.isFinite(Number(ct.totalMarks))) {
      block += `CT total marks stated on blueprint: ${ct.totalMarks}\n`;
    }
    if (ct.requiresMathematics === true) {
      block +=
        "Blueprint expects mathematical / numerical / calculation-type questions in the CT portion.\n";
    }
    if (ct.description) {
      block += `CT layout notes: ${ct.description}\n`;
    }
    if (
      Array.isArray(term.patterns) &&
      term.patterns.length > 0 &&
      (!ct.patterns || ct.patterns.length === 0)
    ) {
      block +=
        "(CT-specific rows were not split in the blueprint; use only short CT-style questions—do not copy full term long-answer weighting.)\n";
    }
  } else {
    const rows =
      Array.isArray(term.patterns) && term.patterns.length > 0
        ? term.patterns
        : ep.patterns || [];
    block += formatPatternRows(rows, "TERM / FINAL EXAM STRUCTURE TO FOLLOW");
    if (term.totalMarks != null && Number.isFinite(Number(term.totalMarks))) {
      block += `Term total marks stated on blueprint: ${term.totalMarks}\n`;
    }
    if (term.requiresMathematics === true) {
      block +=
        "Blueprint expects mathematical / numerical / derivation questions in the term portion.\n";
    }
    if (term.description) {
      block += `Term layout notes: ${term.description}\n`;
    }
  }

  if (ep.commonTopics?.length) {
    block += `Common topics: ${ep.commonTopics.join(", ")}\n`;
  }
  if (ep.questionDistribution) {
    const qd = ep.questionDistribution;
    block += `Difficulty mix (if relevant): easy ${qd.easy ?? "?"}, medium ${qd.medium ?? "?"}, hard ${qd.hard ?? "?"}\n`;
  }
  if (ep.extractionNotes) {
    block += `Extraction notes: ${ep.extractionNotes}\n`;
  }
  return block;
}

/**
 * Resolved total marks target for CT (default 30). Uses learned ctSection.totalMarks when valid.
 */
function resolveCtMarkTotal(ep) {
  const raw = ep?.ctSection?.totalMarks;
  const n = Number(raw);
  if (Number.isFinite(n) && n > 0) return Math.round(n);
  return 30;
}

/**
 * Resolved total marks hint for term; null means let model infer from blueprint.
 */
function resolveTermMarkTotal(ep) {
  const raw = ep?.termSection?.totalMarks;
  const n = Number(raw);
  if (Number.isFinite(n) && n > 0) return Math.round(n);
  return null;
}

/**
 * @param {string} extractedText - full extracted document text
 * @param {typeof import('./gemini').callGemini} callGemini
 */
async function extractExamPatternWithGemini(extractedText, callGemini) {
  const clipped = clipPaperText(extractedText);
  const userMessage = `The following is extracted text from one official question paper or blueprint. Analyze it and return ONLY the JSON object described in your instructions.

---BEGIN PAPER---
${clipped}
---END PAPER---`;

  let response;
  try {
    response = await callGemini(EXAM_PATTERN_SYSTEM_PROMPT, userMessage, {
      temperature: 0.2,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    });
  } catch (err) {
    console.warn(
      "Pattern extraction: JSON response mode failed, retrying without:",
      err.message,
    );
    response = await callGemini(EXAM_PATTERN_SYSTEM_PROMPT, userMessage, {
      temperature: 0.2,
      maxOutputTokens: 8192,
    });
  }

  return normalizePatternData(parseModelPatternJson(response));
}

module.exports = {
  EXAM_PATTERN_SYSTEM_PROMPT,
  clipPaperText,
  parseModelPatternJson,
  extractExamPatternWithGemini,
  buildBlueprintPromptBlock,
  resolveCtMarkTotal,
  resolveTermMarkTotal,
};
