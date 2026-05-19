import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

export default function Landing() {
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <Head>
        <title>Study Assistant - Transform Learning with AI</title>
        <meta
          name="description"
          content="AI-powered study platform that transforms your study materials into personalized flashcards, practice questions, and highlights"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div
        style={{ background: "linear-gradient(to bottom, #f1f5f9, #ffffff)" }}
      >
        {/* Navigation */}
        <nav
          style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
          className="sticky top-0 z-50"
        >
          <div
            style={{
              maxWidth: "1400px",
              margin: "0 auto",
              padding: "16px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: "var(--primary)",
                }}
              >
                📚 Study Assistant
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  fontWeight: "500",
                }}
              >
                By Prosun Mukherjee
              </div>
            </div>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <Link
                href="/login"
                style={{
                  padding: "8px 16px",
                  color: "var(--text)",
                  textDecoration: "none",
                  fontWeight: "500",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.color = "var(--primary)")}
                onMouseLeave={(e) => (e.target.style.color = "var(--text)")}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                style={{
                  padding: "10px 24px",
                  background:
                    "linear-gradient(135deg, var(--primary), var(--accent))",
                  color: "white",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: "600",
                }}
              >
                Sign up
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section style={{ padding: "80px 24px", textAlign: "center" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <h1
              style={{
                fontSize: "3.5rem",
                fontWeight: "800",
                color: "var(--text)",
                marginBottom: "24px",
                lineHeight: "1.2",
              }}
            >
              Master Your Studies with{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary), var(--accent))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                AI-Powered Learning
              </span>
            </h1>
            <p
              style={{
                fontSize: "1.25rem",
                color: "var(--text-light)",
                marginBottom: "40px",
                lineHeight: "1.6",
                maxWidth: "700px",
                margin: "0 auto 40px",
              }}
            >
              Transform your study materials into interactive learning
              experiences. Generate flashcards, practice questions, and
              highlights in seconds with AI.
            </p>
            <div
              style={{
                display: "flex",
                gap: "16px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link
                href="/signup"
                className="btn-gradient"
                style={{ padding: "16px 40px", fontSize: "1rem" }}
              >
                Start Learning Free
              </Link>
              <Link
                href="/login"
                className="btn-outline"
                style={{ padding: "16px 40px", fontSize: "1rem" }}
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section
          style={{
            background:
              "linear-gradient(135deg, var(--primary), var(--primary-dark))",
            padding: "60px 24px",
            color: "white",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "40px",
              textAlign: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "3rem",
                  fontWeight: "800",
                  marginBottom: "8px",
                }}
              >
                50K+
              </div>
              <div style={{ fontSize: "1.1rem", opacity: 0.9 }}>
                Students Learning Smarter
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: "3rem",
                  fontWeight: "800",
                  marginBottom: "8px",
                }}
              >
                1M+
              </div>
              <div style={{ fontSize: "1.1rem", opacity: 0.9 }}>
                AI-Generated Study Resources
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: "3rem",
                  fontWeight: "800",
                  marginBottom: "8px",
                }}
              >
                99%
              </div>
              <div style={{ fontSize: "1.1rem", opacity: 0.9 }}>
                Student Satisfaction Rate
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          style={{ padding: "80px 24px", maxWidth: "1200px", margin: "0 auto" }}
        >
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Simple steps to transform your study journey</p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "32px",
            }}
          >
            <div className="feature-card">
              <div className="feature-icon">📤</div>
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  color: "var(--text)",
                  marginBottom: "12px",
                }}
              >
                Upload Materials
              </h3>
              <p style={{ color: "var(--text-light)", lineHeight: "1.6" }}>
                Upload PDFs, textbooks, or notes. Our AI instantly analyzes and
                extracts key information.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  color: "var(--text)",
                  marginBottom: "12px",
                }}
              >
                Generate Resources
              </h3>
              <p style={{ color: "var(--text-light)", lineHeight: "1.6" }}>
                Get AI-powered flashcards, practice questions, and study
                highlights tailored to your content.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  color: "var(--text)",
                  marginBottom: "12px",
                }}
              >
                Study Smarter
              </h3>
              <p style={{ color: "var(--text-light)", lineHeight: "1.6" }}>
                Review with spaced repetition, test yourself, and track progress
                with advanced analytics.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section
          style={{
            padding: "80px 24px",
            background:
              "linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(139, 92, 246, 0.05))",
          }}
        >
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div className="section-header">
              <h2>Why Students Choose Study Assistant</h2>
              <p>Everything you need for academic success</p>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "24px",
              }}
            >
              {[
                {
                  icon: "✨",
                  title: "AI-Powered",
                  desc: "Advanced AI adapts to your learning style",
                },
                {
                  icon: "⚙️",
                  title: "Fully Customizable",
                  desc: "Create personalized study plans",
                },
                {
                  icon: "📊",
                  title: "Smart Analytics",
                  desc: "Track progress with detailed insights",
                },
                {
                  icon: "🔒",
                  title: "Secure & Private",
                  desc: "Your data is protected with encryption",
                },
                {
                  icon: "📱",
                  title: "Mobile Friendly",
                  desc: "Study anywhere, anytime, on any device",
                },
                {
                  icon: "🚀",
                  title: "Fast & Reliable",
                  desc: "Lightning-fast performance guaranteed",
                },
              ].map((benefit, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "24px",
                    background: "white",
                    borderRadius: "12px",
                    border: "1px solid var(--border)",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 12px 24px rgba(37, 99, 235, 0.1)";
                    e.currentTarget.style.transform = "translateY(-4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ fontSize: "2rem", marginBottom: "12px" }}>
                    {benefit.icon}
                  </div>
                  <h4
                    style={{
                      fontWeight: "700",
                      color: "var(--text)",
                      marginBottom: "8px",
                    }}
                  >
                    {benefit.title}
                  </h4>
                  <p
                    style={{ color: "var(--text-light)", fontSize: "0.95rem" }}
                  >
                    {benefit.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <div
          className="cta-section"
          style={{
            maxWidth: "900px",
            margin: "80px auto 0",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <h2>Ready to Transform Your Learning?</h2>
          <p>
            Join thousands of students who are mastering their subjects faster
            with AI-powered study tools.
          </p>
          <div
            style={{
              display: "flex",
              gap: "16px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/signup"
              style={{
                padding: "14px 36px",
                background: "white",
                color: "var(--primary)",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "700",
                fontSize: "1rem",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) =>
                (e.target.style.transform = "translateY(-3px)")
              }
              onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
            >
              Create Free Account
            </Link>
            <Link
              href="/login"
              style={{
                padding: "14px 36px",
                border: "2px solid white",
                color: "white",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "700",
                fontSize: "1rem",
                transition: "all 0.3s",
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
              }}
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer
          style={{
            padding: "60px 24px 40px",
            borderTop: "1px solid var(--border)",
            marginTop: "80px",
            color: "var(--text-light)",
            background: "#f8fafc",
          }}
        >
          <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "40px",
                marginBottom: "40px",
              }}
            >
              {/* About */}
              <div>
                <h3
                  style={{
                    color: "var(--text)",
                    fontWeight: "700",
                    marginBottom: "12px",
                  }}
                >
                  About Study Assistant
                </h3>
                <p style={{ lineHeight: "1.6", fontSize: "0.95rem" }}>
                  AI-powered learning platform transforming study materials into
                  interactive experiences. Built with modern web technologies
                  for better learning outcomes.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h3
                  style={{
                    color: "var(--text)",
                    fontWeight: "700",
                    marginBottom: "12px",
                  }}
                >
                  Quick Links
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <Link
                    href="/login"
                    style={{
                      color: "var(--text-light)",
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.color = "var(--primary)")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.color = "var(--text-light)")
                    }
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    style={{
                      color: "var(--text-light)",
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.color = "var(--primary)")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.color = "var(--text-light)")
                    }
                  >
                    Create Account
                  </Link>
                  <a
                    href="javascript:void(0)"
                    style={{
                      color: "var(--text-light)",
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.color = "var(--primary)")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.color = "var(--text-light)")
                    }
                  >
                    Privacy Policy
                  </a>
                  <a
                    href="javascript:void(0)"
                    style={{
                      color: "var(--text-light)",
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.color = "var(--primary)")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.color = "var(--text-light)")
                    }
                  >
                    Terms of Service
                  </a>
                </div>
              </div>

              {/* Developer Info */}
              <div>
                <h3
                  style={{
                    color: "var(--text)",
                    fontWeight: "700",
                    marginBottom: "12px",
                  }}
                >
                  Developer
                </h3>
                <p
                  style={{
                    lineHeight: "1.6",
                    fontSize: "0.95rem",
                    marginBottom: "12px",
                  }}
                >
                  <strong>Prosun Mukherjee</strong>
                  <br />
                  MERN Stack Developer
                  <br />
                  Khulna, Bangladesh
                </p>
              </div>

              {/* Contact & Social */}
              <div>
                <h3
                  style={{
                    color: "var(--text)",
                    fontWeight: "700",
                    marginBottom: "12px",
                  }}
                >
                  Connect
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <a
                    href="mailto:prosunsajal123@gmail.com"
                    style={{
                      color: "var(--text-light)",
                      textDecoration: "none",
                      fontSize: "0.95rem",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.color = "var(--primary)")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.color = "var(--text-light)")
                    }
                  >
                    📧 prosunsajal123@gmail.com
                  </a>
                  <a
                    href="tel:+8801911572117"
                    style={{
                      color: "var(--text-light)",
                      textDecoration: "none",
                      fontSize: "0.95rem",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.color = "var(--primary)")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.color = "var(--text-light)")
                    }
                  >
                    📱 +880 191 157 2117
                  </a>
                  <div
                    style={{ display: "flex", gap: "12px", marginTop: "8px" }}
                  >
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "var(--text-light)",
                        textDecoration: "none",
                        fontSize: "1rem",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.color = "var(--primary)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.color = "var(--text-light)")
                      }
                    >
                      GitHub
                    </a>
                    <span style={{ color: "var(--border)" }}>•</span>
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "var(--text-light)",
                        textDecoration: "none",
                        fontSize: "1rem",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.color = "var(--primary)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.color = "var(--text-light)")
                      }
                    >
                      LinkedIn
                    </a>
                    <span style={{ color: "var(--border)" }}>•</span>
                    <a
                      href="https://portfolio.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "var(--text-light)",
                        textDecoration: "none",
                        fontSize: "1rem",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.color = "var(--primary)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.color = "var(--text-light)")
                      }
                    >
                      Portfolio
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: "24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <div style={{ fontSize: "0.9rem" }}>
                © 2026 Study Assistant. All rights reserved.
              </div>
              <div style={{ fontSize: "0.85rem" }}>
                Built with <span style={{ color: "var(--error)" }}>❤️</span> by{" "}
                <strong>Prosun Mukherjee</strong>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
