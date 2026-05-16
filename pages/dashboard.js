import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { apiCall } from "../lib/api";

export const dynamic = "force-dynamic";

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
    if (typeof window !== "undefined") {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        router.push("/login");
        return;
      }
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
          <h2>📚 Study Assistant</h2>
          <nav>
            <Link href="/dashboard" className="nav-item">
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
              <span>⭐</span> Highlights
            </Link>
            <button
              onClick={() => {
                localStorage.clear();
                router.push("/login");
              }}
              className="nav-item"
            >
              <span>🚪</span> Logout
            </button>
          </nav>
        </aside>

        <main className="main-content">
          <div
            className="card"
            style={{ display: "flex", alignItems: "center", gap: "12px" }}
          >
            <span className="text-2xl">💡</span>
            <span>
              Upload your question pattern PDF or textbook to improve question
              quality
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <div className="card-title">{stats.documents}</div>
              <div className="text-text-light">Documents Uploaded</div>
            </div>
            <div className="card">
              <div className="card-title">{stats.highlights}</div>
              <div className="text-text-light">Highlights Generated</div>
            </div>
            <div className="card">
              <div className="card-title">{stats.questions}</div>
              <div className="text-text-light">Questions Generated</div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-5">
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--primary)" }}
            >
              Your Subjects
            </h1>
            <button
              className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
              onClick={() => setShowModal(true)}
            >
                <span>➕</span> Add Subject
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => {
              const sid = String(subject._id);
              const n = docCountBySubject[sid] ?? 0;
              return (
                <div
                  key={subject._id}
                  className="bg-surface p-6 rounded-lg shadow-md border border-border hover:shadow-lg transition-shadow duration-200"
                >
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
                    <div className="text-xl font-semibold text-text mb-1">
                      {subject.name}
                    </div>
                    {subject.code && (
                      <div className="text-text-muted mb-3">{subject.code}</div>
                    )}
                    <div className="text-text-light text-sm">
                      <span>
                        📄 {n} document{n === 1 ? "" : "s"} — open list
                      </span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Link
                      href={`/subjects/${sid}`}
                      className="inline-block px-3 py-1.5 rounded-md text-sm no-underline transition-colors duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Subject page (by type) →
                    </Link>
                  </div>
                </div>
              );
            })}
            {subjects.length === 0 && (
              <div className="bg-surface p-10 rounded-lg shadow-md border border-border text-center col-span-full">
                <p className="text-text-light mb-5">
                  No subjects yet. Add your first subject to get started!
                </p>
                <button
                  className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors duration-200"
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
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-surface p-6 rounded-lg shadow-lg max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-text">
                Add New Subject
              </h3>
              <button
                className="text-text-muted hover:text-text text-xl"
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-text mb-1">
                Subject Name *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={newSubject.name}
                onChange={(e) =>
                  setNewSubject({ ...newSubject, name: e.target.value })
                }
                placeholder="e.g., Mathematics"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-text mb-1">
                Subject Code (Optional)
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={newSubject.code}
                onChange={(e) =>
                  setNewSubject({ ...newSubject, code: e.target.value })
                }
                placeholder="e.g., MATH101"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-text-muted hover:text-text border border-border rounded-md transition-colors duration-200"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md transition-colors duration-200"
                onClick={handleAddSubject}
              >
                Add Subject
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white ${toast.type === "success" ? "bg-success" : toast.type === "error" ? "bg-error" : "bg-warning"} shadow-lg z-50`}
        >
          {toast.message}
        </div>
      )}
    </>
  );
}
