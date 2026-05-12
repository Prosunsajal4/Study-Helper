import { useState, useEffect } from "react";
import AnswerRenderer from "../../components/AnswerRenderer";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { apiCall } from "../../lib/api";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export async function getServerSideProps() {
  return {
    props: {},
  };
}

export default function DocumentDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [document, setDocument] = useState(null);
  const [highlights, setHighlights] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [generating, setGenerating] = useState({
    highlights: false,
    ct: false,
    term: false,
  });
  const [extractingPattern, setExtractingPattern] = useState(false);
  const [patternExtracted, setPatternExtracted] = useState(false);
  const [toast, setToast] = useState(null);
  const [hasQuestionPattern, setHasQuestionPattern] = useState(false);
  const [subjectDocuments, setSubjectDocuments] = useState([]);
  const [selectedDocsForGen, setSelectedDocsForGen] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        router.push("/login");
        return;
      }
    }
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const res = await apiCall(`/api/documents/${id}`);
      const data = await res.json();
      setDocument(data);
      setHighlights(Array.isArray(data.highlights) ? data.highlights : []);
      setQuestions(Array.isArray(data.questions) ? data.questions : []);

      // Check if subject has question pattern
      const patternRes = await apiCall(
        `/api/documents?subjectId=${data.subjectId}&docType=question_pattern`,
      );
      const patterns = await patternRes.json();
      setHasQuestionPattern(Array.isArray(patterns) && patterns.length > 0);

      // Check if this document's pattern is already extracted
      if (data.docType === "question_pattern") {
        const patternCheckRes = await apiCall(
          `/api/question-patterns?documentId=${id}`,
        );
        const patternData = await patternCheckRes.json();
        setPatternExtracted(
          Array.isArray(patternData) && patternData.length > 0,
        );
      }

      // Get all documents for this subject for multi-doc generation
      const subjectDocsRes = await apiCall(
        `/api/documents?subjectId=${data.subjectId}`,
      );
      const subjectDocs = await subjectDocsRes.json();
      const studyMaterials = Array.isArray(subjectDocs)
        ? subjectDocs.filter(
            (d) => d.docType === "study_material" || d.docType === "textbook",
          )
        : [];
      setSubjectDocuments(studyMaterials);
      // Auto-select current document if it's study material
      if (data.docType === "study_material" || data.docType === "textbook") {
        setSelectedDocsForGen([id]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setHighlights([]);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const generateHighlights = async () => {
    setGenerating({ ...generating, highlights: true });
    try {
      const res = await apiCall("/api/highlights/generate", {
        method: "POST",
        body: JSON.stringify({ documentId: id }),
      });

      if (res.ok) {
        const data = await res.json();
        setHighlights([{ content: data }]);
        showToast("Highlights generated successfully", "success");
      } else {
        const error = await res.json();
        showToast(error.error || "Failed to generate highlights", "error");
      }
    } catch (error) {
      showToast("Error generating highlights", "error");
    } finally {
      setGenerating({ ...generating, highlights: false });
    }
  };

  const extractPattern = async () => {
    setExtractingPattern(true);
    try {
      const res = await apiCall("/api/question-patterns/extract", {
        method: "POST",
        body: JSON.stringify({ documentId: id }),
      });

      if (res.ok) {
        const data = await res.json();
        setPatternExtracted(true);
        showToast(
          "Question pattern learned successfully! Future questions will follow this pattern.",
          "success",
        );
      } else {
        const error = await res.json();
        showToast(error.error || "Failed to extract pattern", "error");
      }
    } catch (error) {
      showToast("Error extracting pattern", "error");
    } finally {
      setExtractingPattern(false);
    }
  };

  const generateQuestions = async (examType) => {
    if (selectedDocsForGen.length === 0) {
      showToast("Please select at least one study material document", "error");
      return;
    }

    setGenerating({ ...generating, [examType]: true });
    try {
      const res = await apiCall("/api/questions/generate", {
        method: "POST",
        body: JSON.stringify({ documentIds: selectedDocsForGen, examType }),
      });

      if (res.ok) {
        const data = await res.json();
        setQuestions([
          ...questions,
          { questions: data, examType, generatedAt: new Date() },
        ]);
        showToast(
          `${examType === "ct" ? "CT" : "Term"} questions generated successfully`,
          "success",
        );
      } else {
        const error = await res.json();
        showToast(error.error || "Failed to generate questions", "error");
      }
    } catch (error) {
      showToast("Error generating questions", "error");
    } finally {
      setGenerating({ ...generating, [examType]: false });
    }
  };

  const toggleDocSelection = (docId) => {
    const key = String(docId);
    setSelectedDocsForGen((prev) =>
      prev.map(String).includes(key)
        ? prev.filter((d) => String(d) !== key)
        : [...prev, key],
    );
  };

  const downloadQuestions = (questionSet) => {
    let text = `${questionSet.examType === "ct" ? "Class Test" : "Term Exam"} Questions\n\n`;
    questionSet.questions.forEach((q, index) => {
      text += `Q${index + 1}. ${q.question} [${q.marks} marks] (${q.type})\n`;
      text += `Answer: ${q.answer}\n\n`;
    });

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${questionSet.examType}_questions.txt`;
    a.click();
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (loadError) {
    return (
      <div style={{ padding: "30px" }}>
        <p style={{ color: "var(--danger, #c00)", marginBottom: "16px" }}>
          {loadError}
        </p>
        <Link href="/documents" style={{ color: "var(--primary)" }}>
          ← Back to Documents
        </Link>
      </div>
    );
  }

  if (!document) {
    return <div style={{ padding: "30px" }}>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>{document.fileName} - Study Assistant</title>
      </Head>

      <div className="app-layout">
        <aside className="sidebar">
          <h2 style={{ marginBottom: "30px", fontSize: "1.5rem" }}>
            📚 Study Assistant
          </h2>
          <nav>
            <Link href="/" className="nav-item">
              <span>🏠</span> Dashboard
            </Link>
            <Link href="/upload" className="nav-item">
              <span>📤</span> Upload
            </Link>
            <Link href="/documents" className="nav-item">
              <span>📄</span> Documents
            </Link>
            <Link href="/questions" className="nav-item">
              <span>❓</span> Questions
            </Link>
            <Link href="/highlights" className="nav-item">
              <span>✨</span> Highlights
            </Link>
            <button
              onClick={() => {
                localStorage.clear();
                router.push("/login");
              }}
              className="nav-item"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
                padding: "12px 16px",
                color: "var(--text-light)",
                marginTop: "20px",
              }}
            >
              <span>🚪</span> Logout
            </button>
          </nav>
        </aside>

        <main className="main-content">
          <div style={{ marginBottom: "20px" }}>
            <Link
              href="/documents"
              style={{ color: "var(--primary)", textDecoration: "none" }}
            >
              ← Back to Documents
            </Link>
          </div>

          <h1
            style={{
              fontSize: "2rem",
              color: "var(--primary)",
              marginBottom: "10px",
            }}
          >
            {document.fileName}
          </h1>
          <p style={{ color: "var(--text-light)", marginBottom: "20px" }}>
            Type: {document.docType.replace("_", " ")} | Uploaded:{" "}
            {new Date(document.uploadedAt).toLocaleDateString()}
          </p>

          {!hasQuestionPattern &&
            (document.docType === "study_material" ||
              document.docType === "textbook") && (
              <div className="prompt-banner">
                <span className="prompt-banner-icon">⚡</span>
                <span>
                  Improve your questions: Upload a question pattern PDF for this
                  subject
                </span>
              </div>
            )}

          {document.docType === "question_pattern" && (
            <div className="card">
              <h2 className="card-title">Question Pattern</h2>
              {patternExtracted ? (
                <div
                  style={{
                    color: "var(--success)",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span>✅</span>
                  <span>
                    Pattern learned! Questions will now follow this structure.
                  </span>
                </div>
              ) : (
                <div>
                  <p
                    style={{ marginBottom: "15px", color: "var(--text-light)" }}
                  >
                    Extract the question structure from this paper to improve
                    future question generation.
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={extractPattern}
                    disabled={extractingPattern}
                  >
                    {extractingPattern ? (
                      <>
                        <div
                          className="spinner"
                          style={{
                            width: "16px",
                            height: "16px",
                            marginRight: "8px",
                          }}
                        ></div>
                        Learning Pattern...
                      </>
                    ) : (
                      "🧠 Learn Question Pattern"
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {(document.docType === "study_material" ||
            document.docType === "textbook") && (
            <div className="card">
              <h2 className="card-title">
                Select Documents for Question Generation
              </h2>
              {subjectDocuments.length === 0 ? (
                <p style={{ color: "var(--text-light)" }}>
                  No other study materials found for this subject.
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {subjectDocuments.map((doc) => (
                    <label
                      key={doc._id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedDocsForGen
                          .map(String)
                          .includes(String(doc._id))}
                        onChange={() => toggleDocSelection(doc._id)}
                      />
                      <span>{doc.fileName}</span>
                      {String(doc._id) === String(id) && (
                        <span
                          style={{
                            color: "var(--primary)",
                            fontSize: "0.8rem",
                          }}
                        >
                          (current)
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="card">
            <h2 className="card-title">Actions</h2>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                className="btn btn-primary"
                onClick={generateHighlights}
                disabled={generating.highlights}
              >
                {generating.highlights ? (
                  <>
                    <div
                      className="spinner"
                      style={{
                        width: "16px",
                        height: "16px",
                        marginRight: "8px",
                      }}
                    ></div>
                    Generating with AI...
                  </>
                ) : (
                  "✨ Generate Highlights"
                )}
              </button>
              <button
                className="btn btn-primary"
                onClick={() => generateQuestions("ct")}
                disabled={generating.ct}
              >
                {generating.ct ? (
                  <>
                    <div
                      className="spinner"
                      style={{
                        width: "16px",
                        height: "16px",
                        marginRight: "8px",
                      }}
                    ></div>
                    Generating...
                  </>
                ) : (
                  "📝 Generate CT Questions"
                )}
              </button>
              <button
                className="btn btn-primary"
                onClick={() => generateQuestions("term")}
                disabled={generating.term}
              >
                {generating.term ? (
                  <>
                    <div
                      className="spinner"
                      style={{
                        width: "16px",
                        height: "16px",
                        marginRight: "8px",
                      }}
                    ></div>
                    Generating...
                  </>
                ) : (
                  "📋 Generate Term Questions"
                )}
              </button>
            </div>
          </div>

          <div className="card">
            <h2 className="card-title">Extracted Text Preview</h2>
            <div
              style={{
                background: "var(--surface)",
                padding: "16px",
                borderRadius: "8px",
                maxHeight: "200px",
                overflow: "auto",
              }}
            >
              <p style={{ color: "var(--text-light)", whiteSpace: "pre-wrap" }}>
                {document.extractedText.substring(0, 1000)}
                {document.extractedText.length > 1000 && "..."}
              </p>
            </div>
          </div>

          {highlights.length > 0 && (
            <div className="card">
              <h2 className="card-title">Highlights</h2>
              {highlights.map((highlightSet) =>
                (Array.isArray(highlightSet.content)
                  ? highlightSet.content
                  : []
                ).map((highlight, idx) => (
                  <div
                    key={idx}
                    className={
                      highlight.importance === "high"
                        ? "highlight-high"
                        : "highlight-medium"
                    }
                  >
                    <div className="highlight-topic">{highlight.topic}</div>
                    <div className="highlight-text">{highlight.text}</div>
                  </div>
                )),
              )}
            </div>
          )}

          {questions.length > 0 && (
            <div className="card">
              <h2 className="card-title">Generated Questions</h2>
              {questions.map((questionSet, idx) => (
                <div key={idx} style={{ marginBottom: "30px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "15px",
                    }}
                  >
                    <h3 style={{ color: "var(--primary)" }}>
                      {questionSet.examType === "ct"
                        ? "Class Test"
                        : "Term Exam"}{" "}
                      Questions
                    </h3>
                    <button
                      className="btn btn-secondary"
                      onClick={() => downloadQuestions(questionSet)}
                    >
                      📥 Download
                    </button>
                  </div>
                  {questionSet.questions.map((q, qIdx) => (
                    <div key={qIdx} className="question-card">
                      <div className="question-text">
                        Q{qIdx + 1}. {q.question}
                      </div>
                      <div className="question-answer">
                        <AnswerRenderer answer={q.answer} />
                      </div>
                      <div className="question-meta">
                        <span>Marks: {q.marks}</span>
                        <span>Type: {q.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}
    </>
  );
}
