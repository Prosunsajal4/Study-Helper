import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function ExamSession() {
  const router = useRouter();
  const { id } = router.query;
  const [examSession, setExamSession] = useState(null);

  useEffect(() => {
    if (id) {
      fetchExamSession();
    }
  }, [id]);

  const fetchExamSession = async () => {
    try {
      const res = await fetch(`/api/exam-sessions/${id}`);
      const data = await res.json();
      setExamSession(data);
    } catch (error) {
      console.error('Error fetching exam session:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!examSession) {
    return <div style={{ padding: '30px' }}>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>{examSession.title} - Study Assistant</title>
        <style>{`
          @media print {
            .no-print { display: none !important; }
            body { background: white; }
            .print-only { display: block !important; }
          }
        `}</style>
      </Head>

      <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto', background: 'white' }}>
        <div className="no-print" style={{ marginBottom: '20px' }}>
          <button className="btn btn-secondary" onClick={() => router.back()}>
            ← Back
          </button>
          <button className="btn btn-primary" onClick={handlePrint} style={{ marginLeft: '10px' }}>
            🖨️ Print Exam
          </button>
        </div>

        <div style={{ padding: '40px', border: '2px solid #000', marginBottom: '20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '10px', color: '#000' }}>{examSession.title}</h1>
            <p style={{ fontSize: '1.1rem', color: '#333' }}>
              Subject: {examSession.subjectName}
            </p>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              Date: {new Date(examSession.createdAt).toLocaleDateString()}
            </p>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              Type: {examSession.examType === 'ct' ? 'Class Test' : 'Term Exam'}
            </p>
          </div>

          <div style={{ borderTop: '2px solid #000', marginBottom: '20px' }}></div>

          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#000' }}>Instructions:</h2>
          <ul style={{ marginBottom: '30px', paddingLeft: '20px', lineHeight: '1.8' }}>
            <li>Answer all questions</li>
            <li>Write clearly and legibly</li>
            <li>Show all working where necessary</li>
            <li>Time allowed: 2 hours</li>
          </ul>

          <div style={{ borderTop: '2px solid #000', marginBottom: '30px' }}></div>

          {examSession.questions.map((question, index) => (
            <div key={index} style={{ marginBottom: '30px' }}>
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ fontSize: '1.1rem' }}>
                  Q{index + 1}. {question.question}
                </strong>
                <span style={{ marginLeft: '10px', color: '#666' }}>
                  [{question.marks} marks] ({question.type})
                </span>
              </div>
              <div style={{ marginLeft: '20px', minHeight: '100px', border: '1px dashed #ccc', padding: '15px', background: '#fafafa' }}>
                <p style={{ color: '#999', fontStyle: 'italic' }}>Write your answer here...</p>
              </div>
            </div>
          ))}
        </div>

        <div className="no-print" style={{ textAlign: 'center', marginTop: '30px' }}>
          <button className="btn btn-primary" onClick={handlePrint}>
            🖨️ Print Exam
          </button>
        </div>
      </div>
    </>
  );
}
