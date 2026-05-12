import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { apiCall } from "../lib/api";

export default function Upload() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [uploadData, setUploadData] = useState({
    subjectId: "",
    docType: "study_material",
    file: null,
  });
  const [subjects, setSubjects] = useState([]);
  const [hasQuestionPattern, setHasQuestionPattern] = useState(false);
  const [loading, setLoading] = useState(false);
  const [extractedPreview, setExtractedPreview] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/login");
      return;
    }
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (uploadData.subjectId) {
      checkQuestionPattern();
    }
  }, [uploadData.subjectId]);

  const fetchSubjects = async () => {
    try {
      const res = await apiCall("/api/subjects");
      const data = await res.json();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setSubjects([]);
    }
  };

  const checkQuestionPattern = async () => {
    try {
      const res = await apiCall(
        `/api/documents?subjectId=${uploadData.subjectId}&docType=question_pattern`,
      );
      const data = await res.json();
      setHasQuestionPattern(Array.isArray(data) && data.length > 0);
    } catch (error) {
      console.error("Error checking question pattern:", error);
      setHasQuestionPattern(false);
    }
  };

  const handleCreateSubject = async () => {
    if (!uploadData.newSubjectName) {
      showToast("Subject name is required", "error");
      return;
    }

    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: uploadData.newSubjectName,
          code: uploadData.newSubjectCode,
        }),
      });

      if (res.ok) {
        const newSubject = await res.json();
        setSubjects([...subjects, newSubject]);
        setUploadData({
          ...uploadData,
          subjectId: newSubject._id,
          newSubjectName: "",
          newSubjectCode: "",
        });
        showToast("Subject created successfully", "success");
      } else {
        showToast("Failed to create subject", "error");
      }
    } catch (error) {
      showToast("Error creating subject", "error");
    }
  };

  const handleFileChange = (e) => {
    setUploadData({ ...uploadData, file: e.target.files[0] });
  };

  const handleUpload = async () => {
    if (!uploadData.file || !uploadData.subjectId) {
      showToast("Please select a subject and file", "error");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadData.file);
      formData.append("subjectId", uploadData.subjectId);
      formData.append("docType", uploadData.docType);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "x-user-id": localStorage.getItem("userId"),
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setExtractedPreview(data.extractedTextPreview);
        setStep(4);
        showToast("Document uploaded successfully", "success");
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

  const goToDocument = () => {
    // In a real app, you'd get the document ID from the upload response
    router.push("/documents");
  };

  return (
    <>
      <Head>
        <title>Upload Document - Study Assistant</title>
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
            Upload Document
          </h1>

          {!hasQuestionPattern && uploadData.subjectId && step === 2 && (
            <div className="prompt-banner">
              <span className="prompt-banner-icon">💡</span>
              <span>
                Upload your question pattern PDF to get exam-targeted questions
              </span>
            </div>
          )}

          <div className="card">
            {/* Step Indicator */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  style={{
                    flex: 1,
                    height: "4px",
                    background: step >= s ? "var(--primary)" : "var(--border)",
                    borderRadius: "2px",
                  }}
                />
              ))}
            </div>

            {/* Step 1: Select Subject */}
            {step === 1 && (
              <div>
                <h2 className="card-title">Step 1: Select Subject</h2>
                <div className="form-group">
                  <label className="form-label">Select Subject</label>
                  <select
                    className="form-select"
                    value={uploadData.subjectId}
                    onChange={(e) =>
                      setUploadData({
                        ...uploadData,
                        subjectId: e.target.value,
                      })
                    }
                  >
                    <option value="">-- Choose a subject --</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name} {subject.code && `(${subject.code})`}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ textAlign: "center", margin: "20px 0" }}>or</div>
                <div className="form-group">
                  <label className="form-label">Create New Subject</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Subject Name"
                    value={uploadData.newSubjectName}
                    onChange={(e) =>
                      setUploadData({
                        ...uploadData,
                        newSubjectName: e.target.value,
                      })
                    }
                    style={{ marginBottom: "10px" }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Subject Code (Optional)"
                    value={uploadData.newSubjectCode}
                    onChange={(e) =>
                      setUploadData({
                        ...uploadData,
                        newSubjectCode: e.target.value,
                      })
                    }
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    className="btn btn-secondary"
                    onClick={handleCreateSubject}
                  >
                    Create Subject
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => setStep(2)}
                    disabled={!uploadData.subjectId}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Select Document Type */}
            {step === 2 && (
              <div>
                <h2 className="card-title">Step 2: Select Document Type</h2>
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
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    className="btn btn-secondary"
                    onClick={() => setStep(1)}
                  >
                    ← Back
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => setStep(3)}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Upload File */}
            {step === 3 && (
              <div>
                <h2 className="card-title">Step 3: Upload File</h2>
                <div className="form-group">
                  <label className="form-label">
                    Select File (PDF or DOCX, max 20MB)
                  </label>
                  <input
                    type="file"
                    className="form-input"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                  />
                  {uploadData.file && (
                    <p
                      style={{ marginTop: "10px", color: "var(--text-light)" }}
                    >
                      Selected: {uploadData.file.name} (
                      {(uploadData.file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    className="btn btn-secondary"
                    onClick={() => setStep(2)}
                    disabled={uploading}
                  >
                    ← Back
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleUpload}
                    disabled={!uploadData.file || uploading}
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
                      "Upload →"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Preview */}
            {step === 4 && (
              <div>
                <h2 className="card-title">Step 4: Upload Complete!</h2>
                <div
                  style={{
                    marginBottom: "20px",
                    padding: "20px",
                    background: "var(--surface)",
                    borderRadius: "8px",
                  }}
                >
                  <h3 style={{ marginBottom: "10px", color: "var(--success)" }}>
                    ✓ Document uploaded successfully
                  </h3>
                  <p style={{ marginBottom: "10px" }}>
                    <strong>Extracted Text Preview:</strong>
                  </p>
                  <p
                    style={{ color: "var(--text-light)", fontStyle: "italic" }}
                  >
                    {extractedPreview}...
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    className="btn btn-secondary"
                    onClick={() => router.push("/upload")}
                  >
                    Upload Another
                  </button>
                  <button className="btn btn-primary" onClick={goToDocument}>
                    View Documents
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}
    </>
  );
}
