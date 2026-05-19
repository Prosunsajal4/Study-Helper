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
        <title>Dashboard - Study Assistant</title>
        <meta
          name="description"
          content="AI-powered study assistant dashboard"
        />
      </Head>

      <div className="app-layout">
        {/* Modern Sidebar */}
        <aside
          className="sidebar"
          style={{
            background:
              "linear-gradient(180deg, var(--primary) 0%, var(--primary-dark) 100%)",
          }}
        >
          <h2
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontSize: "1.5rem",
              fontWeight: "700",
              marginBottom: "40px",
              color: "white",
            }}
          >
            <span style={{ fontSize: "2rem" }}>📚</span> Study Assistant
          </h2>
          <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              {
                href: "/dashboard",
                icon: "🏠",
                label: "Dashboard",
                active: true,
              },
              { href: "/upload", icon: "📤", label: "Upload" },
              { href: "/documents", icon: "📄", label: "Documents" },
              { href: "/questions", icon: "❓", label: "Questions" },
              { href: "/highlights", icon: "⭐", label: "Highlights" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="nav-item"
                style={{
                  padding: "12px 15px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  color: item.active ? "white" : "rgba(255,255,255,0.8)",
                  background: item.active
                    ? "rgba(255,255,255,0.15)"
                    : "transparent",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => {
                localStorage.clear();
                router.push("/login");
              }}
              className="nav-item"
              style={{
                padding: "12px 15px",
                borderRadius: "8px",
                textDecoration: "none",
                color: "rgba(255,255,255,0.8)",
                background: "transparent",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                border: "none",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "500",
                marginTop: "20px",
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>🚪</span>
              Logout
            </button>
          </nav>
        </aside>

        <main className="main-content">
          {/* Welcome Section */}
          <div style={{ marginBottom: "40px" }}>
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: "800",
                color: "var(--text)",
                marginBottom: "8px",
              }}
            >
              Welcome back! 👋
            </h1>
            <p style={{ fontSize: "1.1rem", color: "var(--text-light)" }}>
              Here&apos;s your learning progress at a glance.
            </p>
          </div>

          {/* Stats Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
              marginBottom: "40px",
            }}
          >
            <div className="stat-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div className="stat-number">{stats.documents}</div>
                  <div className="stat-label">Documents Uploaded</div>
                </div>
                <div style={{ fontSize: "3rem", opacity: 0.2 }}>📄</div>
              </div>
            </div>
            <div className="stat-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div className="stat-number">{stats.highlights}</div>
                  <div className="stat-label">Highlights Generated</div>
                </div>
                <div style={{ fontSize: "3rem", opacity: 0.2 }}>⭐</div>
              </div>
            </div>
            <div className="stat-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div className="stat-number">{stats.questions}</div>
                  <div className="stat-label">Questions Generated</div>
                </div>
                <div style={{ fontSize: "3rem", opacity: 0.2 }}>❓</div>
              </div>
            </div>
          </div>

          {/* Quick Tips Section */}
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(139, 92, 246, 0.1))",
              borderRadius: "12px",
              padding: "24px",
              marginBottom: "40px",
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}
            >
              <div style={{ fontSize: "2rem" }}>💡</div>
              <div>
                <h3
                  style={{
                    fontWeight: "700",
                    color: "var(--text)",
                    marginBottom: "8px",
                    fontSize: "1.1rem",
                  }}
                >
                  Pro Tip
                </h3>
                <p style={{ color: "var(--text-light)", lineHeight: "1.6" }}>
                  Upload your exam question patterns to significantly improve
                  the quality of AI-generated questions. This helps our system
                  learn your exam style better.
                </p>
              </div>
            </div>
          </div>

          {/* Subjects Section */}
          <div style={{ marginBottom: "40px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: "800",
                    color: "var(--text)",
                    marginBottom: "4px",
                  }}
                >
                  Your Subjects
                </h2>
                <p style={{ color: "var(--text-light)" }}>
                  Manage and organize your study materials
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="btn-gradient"
                style={{
                  padding: "12px 28px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>➕</span> Add Subject
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "24px",
              }}
            >
              {subjects.map((subject) => {
                const sid = String(subject._id);
                const docCount = docCountBySubject[sid] ?? 0;
                return (
                  <div
                    key={subject._id}
                    className="feature-card"
                    style={{ cursor: "pointer", overflow: "hidden" }}
                    onClick={() => router.push(`/documents?subjectId=${sid}`)}
                  >
                    <div style={{ marginBottom: "20px" }}>
                      <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>
                        📚
                      </div>
                      <h3
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: "700",
                          color: "var(--text)",
                          marginBottom: "4px",
                        }}
                      >
                        {subject.name}
                      </h3>
                      {subject.code && (
                        <p
                          style={{
                            fontSize: "0.9rem",
                            color: "var(--text-light)",
                            fontWeight: "500",
                          }}
                        >
                          {subject.code}
                        </p>
                      )}
                    </div>
                    <div
                      style={{
                        borderTop: "1px solid var(--border)",
                        paddingTop: "16px",
                        marginBottom: "16px",
                        display: "flex",
                        gap: "24px",
                        fontSize: "0.95rem",
                        color: "var(--text-light)",
                      }}
                    >
                      <div>
                        <div
                          style={{ fontWeight: "700", color: "var(--primary)" }}
                        >
                          {docCount}
                        </div>
                        <div>Document{docCount !== 1 ? "s" : ""}</div>
                      </div>
                    </div>
                    <Link
                      href={`/subjects/${sid}`}
                      style={{
                        display: "inline-block",
                        color: "var(--primary)",
                        textDecoration: "none",
                        fontWeight: "600",
                        fontSize: "0.95rem",
                      }}
                    >
                      View by type →
                    </Link>
                  </div>
                );
              })}

              {subjects.length === 0 && (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    padding: "60px 40px",
                    background: "var(--surface)",
                    borderRadius: "12px",
                    border: "2px dashed var(--border)",
                  }}
                >
                  <div style={{ fontSize: "3rem", marginBottom: "16px" }}>
                    📚
                  </div>
                  <h3
                    style={{
                      fontWeight: "700",
                      color: "var(--text)",
                      marginBottom: "12px",
                      fontSize: "1.25rem",
                    }}
                  >
                    No Subjects Yet
                  </h3>
                  <p
                    style={{ color: "var(--text-light)", marginBottom: "24px" }}
                  >
                    Create your first subject to start organizing your study
                    materials
                  </p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="btn-gradient"
                    style={{
                      padding: "12px 28px",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    <span style={{ marginRight: "8px" }}>➕</span> Create
                    Subject
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: "0",
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: "50",
            padding: "20px",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "var(--surface)",
              borderRadius: "12px",
              boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
              maxWidth: "500px",
              width: "100%",
              padding: "32px",
              animation: "slideUp 0.3s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: "var(--text)",
                }}
              >
                Add New Subject
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "var(--text-light)",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: "600",
                  color: "var(--text)",
                  marginBottom: "8px",
                  fontSize: "0.95rem",
                }}
              >
                Subject Name *
              </label>
              <input
                type="text"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                  boxSizing: "border-box",
                }}
                value={newSubject.name}
                onChange={(e) =>
                  setNewSubject({ ...newSubject, name: e.target.value })
                }
                placeholder="e.g., Mathematics"
                onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            <div style={{ marginBottom: "28px" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: "600",
                  color: "var(--text)",
                  marginBottom: "8px",
                  fontSize: "0.95rem",
                }}
              >
                Subject Code (Optional)
              </label>
              <input
                type="text"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                  boxSizing: "border-box",
                }}
                value={newSubject.code}
                onChange={(e) =>
                  setNewSubject({ ...newSubject, code: e.target.value })
                }
                placeholder="e.g., MATH101"
                onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: "12px 24px",
                  border: "2px solid var(--border)",
                  background: "transparent",
                  color: "var(--text)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "all 0.2s",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddSubject}
                className="btn-gradient"
                style={{
                  padding: "12px 24px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Create Subject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            padding: "16px 24px",
            borderRadius: "8px",
            color: "white",
            fontWeight: "600",
            boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
            animation: "slideIn 0.3s ease-out",
            background:
              toast.type === "success"
                ? "linear-gradient(135deg, var(--success), #059669)"
                : "linear-gradient(135deg, var(--error), #dc2626)",
            zIndex: "50",
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Footer */}
      <footer
        style={{
          marginTop: "60px",
          padding: "40px 24px",
          borderTop: "1px solid var(--border)",
          background: "#f8fafc",
          color: "var(--text-light)",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <p style={{ marginBottom: "12px", fontSize: "0.9rem" }}>
            © 2026 Study Assistant. All rights reserved.
          </p>
          <p style={{ fontSize: "0.85rem" }}>
            Built with <span style={{ color: "var(--error)" }}>❤️</span> by{" "}
            <strong style={{ color: "var(--text)" }}>Prosun Mukherjee</strong> |
            MERN Stack Developer
          </p>
          <div style={{ marginTop: "12px", fontSize: "0.85rem" }}>
            <a
              href="mailto:prosunsajal123@gmail.com"
              style={{
                color: "var(--text-light)",
                textDecoration: "none",
                marginRight: "16px",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.color = "var(--primary)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--text-light)")}
            >
              📧 Email
            </a>
            <a
              href="tel:+8801911572117"
              style={{
                color: "var(--text-light)",
                textDecoration: "none",
                marginRight: "16px",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.color = "var(--primary)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--text-light)")}
            >
              📱 Contact
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--text-light)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.color = "var(--primary)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--text-light)")}
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
