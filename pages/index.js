import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { apiCall } from "../lib/api";

export default function Dashboard() {
  const [subjects, setSubjects] = useState([]);
  const [stats, setStats] = useState({
    documents: 0,
    highlights: 0,
    questions: 0,
  });
  const [showModal, setShowModal] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: "", code: "" });
  const [toast, setToast] = useState(null);
  const [docCountBySubject, setDocCountBySubject] = useState({});
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/login");
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subjectsRes, docsRes, highlightsRes, questionsRes] =
        await Promise.all([
          apiCall("/api/subjects"),
          apiCall("/api/documents?omitDocTypes=question_pattern"),
          apiCall("/api/highlights"),
          apiCall("/api/questions"),
        ]);

      const subjectsData = await subjectsRes.json();
      const docsData = await docsRes.json();
      const highlightsData = await highlightsRes.json();
      const questionsData = await questionsRes.json();

      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);

      const counts = {};
      if (Array.isArray(docsData)) {
        for (const d of docsData) {
          const sid = String(d.subjectId ?? "");
          if (!sid) continue;
          counts[sid] = (counts[sid] || 0) + 1;
        }
      }
      setDocCountBySubject(counts);

      setStats({
        documents: Array.isArray(docsData) ? docsData.length : 0,
        highlights: Array.isArray(highlightsData) ? highlightsData.length : 0,
        questions: Array.isArray(questionsData) ? questionsData.length : 0,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      setSubjects([]);
      setDocCountBySubject({});
      setStats({ documents: 0, highlights: 0, questions: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async () => {
    if (!newSubject.name) {
      showToast("Subject name is required", "error");
      return;
    }

    try {
      const res = await apiCall("/api/subjects", {
        method: "POST",
        body: JSON.stringify(newSubject),
      });

      if (res.ok) {
        showToast("Subject added successfully", "success");
        setShowModal(false);
        setNewSubject({ name: "", code: "" });
        fetchData();
      } else {
        showToast("Failed to add subject", "error");
      }
    } catch (error) {
      showToast("Error adding subject", "error");
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <>
      <Head>
        <title>Study Assistant - Dashboard</title>
        <meta
          name="description"
          content="AI-powered study assistant for students"
        />
      </Head>

      <div className="app-layout">
        <aside className="sidebar">
          <h2 style={{ marginBottom: "30px", fontSize: "1.5rem" }}>
            📚 Study Assistant
          </h2>
          <nav>
            <Link href="/" className="nav-item active">
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
          </nav>
        </aside>

        <main className="main-content">
          <div className="prompt-banner">
            <span className="prompt-banner-icon">💡</span>
            <span>
              Upload your question pattern PDF or textbook to improve question
              quality
            </span>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.documents}</div>
              <div className="stat-label">Documents Uploaded</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.highlights}</div>
              <div className="stat-label">Highlights Generated</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.questions}</div>
              <div className="stat-label">Questions Generated</div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h1 style={{ fontSize: "1.75rem", color: "var(--primary)" }}>
              Your Subjects
            </h1>
            <button
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              <span>➕</span> Add Subject
            </button>
          </div>

          <div className="subjects-grid">
            {subjects.map((subject) => {
              const sid = String(subject._id);
              const n = docCountBySubject[sid] ?? 0;
              return (
                <div key={subject._id} className="subject-card">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => router.push(`/documents?subjectId=${sid}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        router.push(`/documents?subjectId=${sid}`);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="subject-name">{subject.name}</div>
                    {subject.code && (
                      <div className="subject-code">{subject.code}</div>
                    )}
                    <div className="subject-stats">
                      <span>
                        📄 {n} document{n === 1 ? "" : "s"} — open list
                      </span>
                    </div>
                  </div>
                  <div style={{ marginTop: "12px", fontSize: "0.85rem" }}>
                    <Link
                      href={`/subjects/${sid}`}
                      style={{
                        display: "inline-block",
                        padding: "6px 10px",
                        borderRadius: "6px",
                        textDecoration: "none",
                        color: "var(--primary)",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Subject page (by type) →
                    </Link>
                  </div>
                </div>
              );
            })}
            {subjects.length === 0 && (
              <div
                className="card"
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "40px",
                }}
              >
                <p style={{ color: "var(--text-light)", marginBottom: "20px" }}>
                  No subjects yet. Add your first subject to get started!
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowModal(true)}
                >
                  <span>➕</span> Add Subject
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add New Subject</h3>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">Subject Name *</label>
              <input
                type="text"
                className="form-input"
                value={newSubject.name}
                onChange={(e) =>
                  setNewSubject({ ...newSubject, name: e.target.value })
                }
                placeholder="e.g., Mathematics"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Subject Code (Optional)</label>
              <input
                type="text"
                className="form-input"
                value={newSubject.code}
                onChange={(e) =>
                  setNewSubject({ ...newSubject, code: e.target.value })
                }
                placeholder="e.g., MATH101"
              />
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAddSubject}>
                Add Subject
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
