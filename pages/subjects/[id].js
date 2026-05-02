import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

export default function SubjectDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [subject, setSubject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState("study_material");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    file: null,
    docType: "study_material",
  });
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [hasQuestionPattern, setHasQuestionPattern] = useState(false);
  const [hasTextbook, setHasTextbook] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoadError(null);
      const [subjectRes, docsRes] = await Promise.all([
        fetch(`/api/subjects?id=${encodeURIComponent(String(id))}`),
        fetch(`/api/documents?subjectId=${encodeURIComponent(String(id))}`),
      ]);

      const subjectData = await subjectRes.json();
      const docsData = await docsRes.json();

      if (!subjectRes.ok) {
        setSubject(null);
        setLoadError(subjectData.error || "Could not load subject");
        setDocuments([]);
        return;
      }

      setSubject(subjectData);
      setDocuments(Array.isArray(docsData) ? docsData : []);
      setHasQuestionPattern(
        Array.isArray(docsData) &&
          docsData.some((d) => d.docType === "question_pattern"),
      );
      setHasTextbook(
        Array.isArray(docsData) &&
          docsData.some((d) => d.docType === "textbook"),
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      setSubject(null);
      setLoadError("Could not load subject");
      setDocuments([]);
    }
  };

  const handleFileChange = (e) => {
    setUploadData({ ...uploadData, file: e.target.files[0] });
  };

  const handleUpload = async () => {
    if (!uploadData.file) {
      showToast("Please select a file", "error");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", uploadData.file);
    formData.append("subjectId", id);
    formData.append("docType", uploadData.docType);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        showToast("Document uploaded successfully", "success");
        setShowUploadModal(false);
        setUploadData({ file: null, docType: "study_material" });
        fetchData();
      } else {
        const error = await res.json();
        showToast(error.error || "Upload failed", "error");
      }
    } catch (error) {
      showToast("Error uploading document", "error");
    } finally {
      setUploading(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredDocs = documents.filter((d) => d.docType === activeTab);

  if (loadError) {
    return (
      <div style={{ padding: "30px" }}>
        <p style={{ color: "var(--danger, #c00)", marginBottom: "16px" }}>
          {loadError}
        </p>
        <Link href="/" style={{ color: "var(--primary)" }}>
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!subject) {
    return <div style={{ padding: "30px" }}>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>{subject.name} - Study Assistant</title>
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
            <Link
              href={
                id
                  ? `/documents?subjectId=${encodeURIComponent(String(id))}`
                  : "/documents"
              }
              className="nav-item"
            >
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
          <div
            style={{
              marginBottom: "20px",
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              alignItems: "center",
            }}
          >
            <Link
              href="/"
              style={{ color: "var(--primary)", textDecoration: "none" }}
            >
              ← Back to Dashboard
            </Link>
            <Link
              href={`/documents?subjectId=${encodeURIComponent(String(id))}`}
              style={{ color: "var(--primary)", textDecoration: "none" }}
            >
              All documents in this subject →
            </Link>
          </div>

          <h1
            style={{
              fontSize: "2rem",
              color: "var(--primary)",
              marginBottom: "10px",
            }}
          >
            {subject.name}
          </h1>
          {subject.code && (
            <p style={{ color: "var(--text-light)", marginBottom: "20px" }}>
              {subject.code}
            </p>
          )}

          {!hasQuestionPattern && (
            <div
              className="prompt-banner"
              style={{
                background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                color: "#333",
              }}
            >
              <span className="prompt-banner-icon">📋</span>
              <span>
                Upload a question pattern to generate targeted exam questions
              </span>
            </div>
          )}

          {!hasTextbook && (
            <div
              className="prompt-banner"
              style={{
                background: "linear-gradient(135deg, #BDE0FE 0%, #9BC5F0 100%)",
                color: "#333",
              }}
            >
              <span className="prompt-banner-icon">📚</span>
              <span>
                Upload your textbook or reference material for better highlights
              </span>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <div className="tabs">
              <div
                className={`tab ${activeTab === "study_material" ? "active" : ""}`}
                onClick={() => setActiveTab("study_material")}
              >
                Study Materials
              </div>
              <div
                className={`tab ${activeTab === "question_pattern" ? "active" : ""}`}
                onClick={() => setActiveTab("question_pattern")}
              >
                Question Patterns
              </div>
              <div
                className={`tab ${activeTab === "textbook" ? "active" : ""}`}
                onClick={() => setActiveTab("textbook")}
              >
                Textbooks
              </div>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setShowUploadModal(true)}
            >
              <span>📤</span> Upload Document
            </button>
          </div>

          <div className="card">
            {filteredDocs.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  color: "var(--text-light)",
                  padding: "40px",
                }}
              >
                No {activeTab.replace("_", " ")} uploaded yet.
              </p>
            ) : (
              filteredDocs.map((doc) => (
                <div
                  key={doc._id}
                  style={{
                    padding: "16px",
                    borderBottom: "1px solid var(--border)",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onClick={() => router.push(`/documents/${doc._id}`)}
                >
                  <div>
                    <div style={{ fontWeight: "600", color: "var(--primary)" }}>
                      {doc.fileName}
                    </div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--text-light)",
                      }}
                    >
                      Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span style={{ fontSize: "1.2rem" }}>→</span>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {showUploadModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowUploadModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Upload Document</h3>
              <button
                className="modal-close"
                onClick={() => setShowUploadModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">Document Type</label>
              <select
                className="form-select"
                value={uploadData.docType}
                onChange={(e) =>
                  setUploadData({ ...uploadData, docType: e.target.value })
                }
              >
                <option value="study_material">Study Material</option>
                <option value="question_pattern">Question Pattern</option>
                <option value="textbook">Textbook</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">File (PDF or DOCX, max 20MB)</label>
              <input
                type="file"
                className="form-input"
                accept=".pdf,.docx"
                onChange={handleFileChange}
              />
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowUploadModal(false)}
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <div
                      className="spinner"
                      style={{
                        width: "16px",
                        height: "16px",
                        marginRight: "8px",
                      }}
                    ></div>
                    Uploading...
                  </>
                ) : (
                  "Upload"
                )}
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
