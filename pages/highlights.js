import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { apiCall } from "../lib/api";

export const dynamic = "force-dynamic";

export default function HighlightsBrowser() {
  const router = useRouter();
  const [highlights, setHighlights] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filters, setFilters] = useState({ subjectId: "", searchQuery: "" });
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

  useEffect(() => {
    if (filters.subjectId) {
      fetchHighlights();
    }
  }, [filters]);

  const fetchData = async () => {
    try {
      const subjectsRes = await apiCall("/api/subjects");
      const highlightsRes = await apiCall("/api/highlights");
      const subjectsData = await subjectsRes.json();
      const highlightsData = await highlightsRes.json();
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      setHighlights(Array.isArray(highlightsData) ? highlightsData : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setSubjects([]);
      setHighlights([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHighlights = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.subjectId) params.append("subjectId", filters.subjectId);

      const res = await apiCall(`/api/highlights?${params}`);
      const data = await res.json();
      setHighlights(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching highlights:", error);
      setHighlights([]);
    }
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find((s) => s._id === subjectId);
    return subject ? subject.name : "Unknown";
  };

  const filteredHighlights = highlights.filter((h) => {
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      return h.content.some(
        (c) =>
          c.text.toLowerCase().includes(query) ||
          c.topic.toLowerCase().includes(query),
      );
    }
    return true;
  });

  return (
    <>
      <Head>
        <title>Highlights - Study Assistant</title>
      </Head>

      <div className="app-layout">
        <aside className="sidebar">
          <h2 style={{ marginBottom: "30px", fontSize: "1.5rem" }}>
            📚 Study Assistant
          </h2>
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
              <span>✔</span> Questions
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
            Highlights Browser
          </h1>

          <div className="card">
            <h2 className="card-title">Filters</h2>
            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
              <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
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
              <div className="form-group" style={{ marginBottom: 0, flex: 2 }}>
                <label className="form-label">Search</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search by keyword or topic..."
                  value={filters.searchQuery}
                  onChange={(e) =>
                    setFilters({ ...filters, searchQuery: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {filteredHighlights.length === 0 ? (
              <div
                className="card"
                style={{ textAlign: "center", padding: "40px" }}
              >
                <p style={{ color: "var(--text-light)" }}>
                  {highlights.length === 0
                    ? "No highlights found. Upload documents and generate highlights first."
                    : "No highlights match your search criteria."}
                </p>
              </div>
            ) : (
              filteredHighlights.map((highlightSet) => (
                <div key={highlightSet._id} className="card">
                  <div
                    style={{
                      marginBottom: "15px",
                      color: "var(--text-light)",
                      fontSize: "0.9rem",
                    }}
                  >
                    <strong>{getSubjectName(highlightSet.subjectId)}</strong> •
                    Generated:{" "}
                    {new Date(highlightSet.generatedAt).toLocaleDateString()}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {highlightSet.content.map((highlight, idx) => (
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
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </>
  );
}
