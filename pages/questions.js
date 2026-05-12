import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { apiCall } from "../lib/api";
import AnswerRenderer from "../components/AnswerRenderer";

export default function QuestionsBrowser() {
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filters, setFilters] = useState({ subjectId: "", examType: "" });
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [showExamModal, setShowExamModal] = useState(false);
  const [examTitle, setExamTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        router.push("/login");
        return;
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (filters.subjectId || filters.examType) {
      fetchQuestions();
    }
  }, [filters]);

  const fetchData = async () => {
    try {
      const subjectsRes = await apiCall("/api/subjects");
      const questionsRes = await apiCall("/api/questions");
      const subjectsData = await subjectsRes.json();
      const questionsData = await questionsRes.json();
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      setQuestions(Array.isArray(questionsData) ? questionsData : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setSubjects([]);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.subjectId) params.append("subjectId", filters.subjectId);
      if (filters.examType) params.append("examType", filters.examType);

      const res = await apiCall(`/api/questions?${params}`);
      const data = await res.json();
      setQuestions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setQuestions([]);
    }
  };

  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId],
    );
  };

  const toggleAnswerVisibility = (questionId) => {
    const element = document.getElementById(`answer-${questionId}`);
    if (element) {
      element.style.display =
        element.style.display === "none" ? "block" : "none";
    }
  };

  const createExamSession = async () => {
    if (!examTitle || selectedQuestions.length === 0) {
      showToast("Please enter exam title and select questions", "error");
      return;
    }

    try {
      const res = await apiCall("/api/exam-sessions", {
        method: "POST",
        body: JSON.stringify({
          subjectId: filters.subjectId,
          examType: filters.examType,
          title: examTitle,
          selectedQuestionIds: selectedQuestions,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        showToast("Exam session created", "success");
        setShowExamModal(false);
        setExamTitle("");
        setSelectedQuestions([]);
        router.push(`/exam-sessions/${data._id}`);
      } else {
        showToast("Failed to create exam session", "error");
      }
    } catch (error) {
      showToast("Error creating exam session", "error");
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getSubjectName = (subjectId) => {
    const sid = String(subjectId ?? "");
    const subject = subjects.find((s) => String(s._id) === sid);
    return subject ? subject.name : "Unknown";
  };

  return (
    <>
      <Head>
        <title>Questions - Study Assistant</title>
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
          <h1
            style={{
              fontSize: "2rem",
              color: "var(--primary)",
              marginBottom: "30px",
            }}
          >
            Questions Browser
          </h1>

          <div className="prompt-banner">
            <span className="prompt-banner-icon">📋</span>
            <span>
              For best results, upload your previous year question papers first
            </span>
          </div>

          <div className="card">
            <h2 className="card-title">Filters</h2>
            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Subject</label>
                <select
                  className="form-select"
                  value={filters.subjectId}
                  onChange={(e) =>
                    setFilters({ ...filters, subjectId: e.target.value })
                  }
                >
                  <option value="">All Subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Exam Type</label>
                <select
                  className="form-select"
                  value={filters.examType}
                  onChange={(e) =>
                    setFilters({ ...filters, examType: e.target.value })
                  }
                >
                  <option value="">All Types</option>
                  <option value="ct">Class Test</option>
                  <option value="term">Term Exam</option>
                </select>
              </div>
            </div>
          </div>

          {selectedQuestions.length > 0 && (
            <div
              className="card"
              style={{ background: "var(--highlight-medium)" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong>{selectedQuestions.length}</strong> questions selected
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowExamModal(true)}
                >
                  Create Exam Session
                </button>
              </div>
            </div>
          )}

          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {questions.length === 0 ? (
              <div
                className="card"
                style={{ textAlign: "center", padding: "40px" }}
              >
                <p style={{ color: "var(--text-light)" }}>
                  No questions found. Upload documents and generate questions
                  first.
                </p>
              </div>
            ) : (
              questions.map((questionSet) => (
                <div key={questionSet._id} className="card">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <h3
                        style={{ color: "var(--primary)", marginBottom: "5px" }}
                      >
                        {questionSet.examType === "ct"
                          ? "Class Test"
                          : "Term Exam"}
                      </h3>
                      <p
                        style={{
                          color: "var(--text-light)",
                          fontSize: "0.9rem",
                        }}
                      >
                        {getSubjectName(questionSet.subjectId)} •{" "}
                        {new Date(questionSet.generatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedQuestions.includes(questionSet._id)}
                        onChange={() =>
                          toggleQuestionSelection(questionSet._id)
                        }
                      />
                      <button
                        className="btn btn-secondary"
                        onClick={() =>
                          setExpandedCard(
                            expandedCard === questionSet._id
                              ? null
                              : questionSet._id,
                          )
                        }
                      >
                        {expandedCard === questionSet._id ? "▼" : "▶"}
                      </button>
                    </div>
                  </div>

                  {expandedCard === questionSet._id && (
                    <div style={{ marginTop: "20px" }}>
                      {questionSet.questions.map((q, idx) => (
                        <div key={idx} className="question-card">
                          <div className="question-text">
                            Q{idx + 1}. {q.question}
                          </div>
                          <div className="question-meta">
                            <span>Marks: {q.marks}</span>
                            <span>Type: {q.type}</span>
                          </div>
                          <button
                            className="btn btn-secondary"
                            style={{
                              padding: "5px 10px",
                              fontSize: "12px",
                              marginTop: "10px",
                            }}
                            onClick={() =>
                              toggleAnswerVisibility(
                                `${questionSet._id}-${idx}`,
                              )
                            }
                          >
                            {document.getElementById(
                              `answer-${questionSet._id}-${idx}`,
                            )?.style.display === "none"
                              ? "Show Answer"
                              : "Hide Answer"}
                          </button>
                          <AnswerRenderer answer={q.answer} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {showExamModal && (
        <div className="modal-overlay" onClick={() => setShowExamModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create Exam Session</h3>
              <button
                className="modal-close"
                onClick={() => setShowExamModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">Exam Title</label>
              <input
                type="text"
                className="form-input"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                placeholder="e.g., Midterm Exam - Mathematics"
              />
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowExamModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={createExamSession}>
                Create Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}
    </>
  );
}
