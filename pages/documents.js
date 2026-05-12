import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { apiCall } from "../lib/api";

export default function AllDocuments() {
  const router = useRouter();
  const [documents, setDocuments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filters, setFilters] = useState({ subjectId: "", docType: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [examType, setExamType] = useState("ct");
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const hydratedSubjectFromUrl = useRef(false);

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
    if (filters.subjectId || filters.docType) {
      fetchDocuments();
    }
  }, [filters]);

  useEffect(() => {
    if (!router.isReady || hydratedSubjectFromUrl.current) return;
    hydratedSubjectFromUrl.current = true;
    const raw = router.query.subjectId;
    const sid = Array.isArray(raw) ? raw[0] : raw;
    if (sid && typeof sid === "string") {
      setFilters((f) => ({ ...f, subjectId: sid }));
    }
  }, [router.isReady, router.query.subjectId]);

  const fetchData = async () => {
    try {
      const subjectsRes = await apiCall("/api/subjects");
      const subjectsData = await subjectsRes.json();
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      await fetchDocuments();
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.subjectId) params.append("subjectId", filters.subjectId);
      if (filters.docType) {
        params.append("docType", filters.docType);
      }

      const res = await apiCall(`/api/documents?${params}`);
      const data = await res.json();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setDocuments([]);
    }
  };

  const handleGenerateQuestions = async () => {
    if (selectedDocuments.length === 0) {
      showToast("Please select at least one document", "error");
      return;
    }

    setShowGenerateModal(true);
  };

  const confirmGenerateQuestions = async () => {
    setGenerating(true);
    try {
      const res = await apiCall("/api/questions/generate", {
        method: "POST",
        body: JSON.stringify({
          documentIds: selectedDocuments,
          examType,
        }),
      });

      if (res.ok) {
        showToast("Questions generated successfully", "success");
        setShowGenerateModal(false);
        setSelectedDocuments([]);
        router.push("/questions");
      } else {
        const error = await res.json();
        showToast(error.error || "Failed to generate questions", "error");
      }
    } catch (error) {
      showToast("Error generating questions", "error");
    } finally {
      setGenerating(false);
    }
  };

  const toggleDocumentSelection = (docId) => {
    const key = String(docId);
    setSelectedDocuments((prev) =>
      prev.map(String).includes(key)
        ? prev.filter((id) => String(id) !== key)
        : [...prev, key],
    );
  };

  const handleDelete = async () => {
    if (!documentToDelete) return;

    try {
      const res = await apiCall(`/api/documents/${documentToDelete}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast("Document deleted successfully", "success");
        setShowDeleteModal(false);
        setDocumentToDelete(null);
        fetchData();
      } else {
        showToast("Failed to delete document", "error");
      }
    } catch (error) {
      showToast("Error deleting document", "error");
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

  const generateHighlights = async (documentId) => {
    try {
      const res = await fetch("/api/highlights/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      });

      if (res.ok) {
        showToast("Highlights generated successfully", "success");
      } else {
        showToast("Failed to generate highlights", "error");
      }
    } catch (error) {
      showToast("Error generating highlights", "error");
    }
  };

  const generateQuestions = async (documentId, examType) => {
    try {
      const res = await fetch("/api/questions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, examType }),
      });

      if (res.ok) {
        showToast("Questions generated successfully", "success");
      } else {
        showToast("Failed to generate questions", "error");
      }
    } catch (error) {
      showToast("Error generating questions", "error");
    }
  };

  return (
    <>
      <Head>
        <title>All Documents - Study Assistant</title>
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
            All Documents
          </h1>

          <div className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <h2 className="card-title">Filters</h2>
              <div
                style={{ display: "flex", gap: "10px", alignItems: "center" }}
              >
                <span
                  style={{ fontSize: "0.9rem", color: "var(--text-light)" }}
                >
                  {selectedDocuments.length} document(s) selected
                </span>
                {selectedDocuments.length > 0 && (
                  <button
                    className="btn btn-primary"
                    onClick={handleGenerateQuestions}
                  >
                    Generate Questions from Selected
                  </button>
                )}
              </div>
            </div>
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
                <label className="form-label">Document Type</label>
                <select
                  className="form-select"
                  value={filters.docType}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      docType: e.target.value,
                    })
                  }
                >
                  <option value="">Study materials & textbooks</option>
                  <option value="study_material">Study Material only</option>
                  <option value="question_pattern">
                    Question pattern only
                  </option>
                  <option value="textbook">Textbook only</option>
                </select>
              </div>
            </div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "12px",
                cursor: "pointer",
                fontSize: "0.95rem",
                color: "var(--text-light)",
              }}
            >
              <input
                type="checkbox"
                checked={filters.includeQuestionPatterns}
                disabled={!!filters.docType}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    includeQuestionPatterns: e.target.checked,
                  })
                }
              />
              Also show question-pattern PDFs in this table
              {filters.docType ? (
                <span style={{ fontSize: "0.8rem" }}>
                  (clear &quot;Document type&quot; filter to use this)
                </span>
              ) : null}
            </label>
          </div>

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>
                    <input
                      type="checkbox"
                      style={{
                        width: "20px",
                        height: "20px",
                        cursor: "pointer",
                      }}
                      checked={
                        documents.length > 0 &&
                        selectedDocuments.length === documents.length &&
                        documents.every((d) =>
                          selectedDocuments.map(String).includes(String(d._id)),
                        )
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDocuments(
                            documents.map((d) => String(d._id)),
                          );
                        } else {
                          setSelectedDocuments([]);
                        }
                      }}
                    />
                  </th>
                  <th>Name</th>
                  <th>Subject</th>
                  <th>Type</th>
                  <th>Upload Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "var(--text-light)",
                      }}
                    >
                      No documents found. Upload your first document to get
                      started.
                    </td>
                  </tr>
                ) : (
                  documents.map((doc) => (
                    <tr key={doc._id}>
                      <td>
                        <input
                          type="checkbox"
                          style={{
                            width: "20px",
                            height: "20px",
                            cursor: "pointer",
                          }}
                          checked={selectedDocuments
                            .map(String)
                            .includes(String(doc._id))}
                          onChange={() => toggleDocumentSelection(doc._id)}
                        />
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: "5px 10px", fontSize: "12px" }}
                          onClick={() => router.push(`/documents/${doc._id}`)}
                        >
                          {doc.fileName}
                        </button>
                      </td>
                      <td>{getSubjectName(doc.subjectId)}</td>
                      <td>{doc.docType.replace("_", " ")}</td>
                      <td>{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: "flex", gap: "5px" }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: "5px 10px", fontSize: "12px" }}
                            onClick={() => router.push(`/documents/${doc._id}`)}
                          >
                            View
                          </button>
                          <button
                            className="btn btn-primary"
                            style={{ padding: "5px 10px", fontSize: "12px" }}
                            onClick={() => generateHighlights(doc._id)}
                          >
                            Highlights
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: "5px 10px", fontSize: "12px" }}
                            onClick={() => {
                              setDocumentToDelete(doc._id);
                              setShowDeleteModal(true);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {showDeleteModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Confirm Delete</h3>
              <button
                className="modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                &times;
              </button>
            </div>
            <p style={{ marginBottom: "20px" }}>
              Are you sure you want to delete this document? This will also
              delete all associated highlights and questions.
            </p>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showGenerateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowGenerateModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Generate Questions</h3>
              <button
                className="modal-close"
                onClick={() => setShowGenerateModal(false)}
              >
                &times;
              </button>
            </div>
            <p style={{ marginBottom: "20px" }}>
              Generate questions from {selectedDocuments.length} selected
              document(s).
            </p>
            <div className="form-group">
              <label className="form-label">Exam Type</label>
              <select
                className="form-select"
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
              >
                <option value="ct">Class Test (Short questions)</option>
                <option value="term">Term Exam (Long questions)</option>
              </select>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowGenerateModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={confirmGenerateQuestions}
                disabled={generating}
              >
                {generating ? "Generating..." : "Generate Questions"}
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
