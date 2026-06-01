import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "../styles/auth.module.css";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("userId", data.user._id);
        router.push("/dashboard");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (error) {
      setError("Error logging in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - Study Assistant</title>
        <meta name="description" content="Sign in to Study Assistant" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)",
          padding: "20px",
          fontFamily: "inherit",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "420px",
            background: "var(--surface)",
            borderRadius: "var(--radius-lg)",
            padding: "48px 32px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: "32px", textAlign: "center" }}>
            <h1
              style={{
                fontSize: "2rem",
                fontWeight: "800",
                background: "linear-gradient(135deg, var(--primary), var(--accent))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                marginBottom: "8px",
              }}
            >
              📚 Study Assistant
            </h1>
            <p style={{ color: "var(--text-light)", fontSize: "0.95rem" }}>
              Welcome back! Continue your learning journey
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div
              style={{
                background: "#fee",
                color: "#c33",
                padding: "12px 16px",
                borderRadius: "var(--radius-sm)",
                marginBottom: "24px",
                border: "1px solid #fcc",
                fontSize: "0.9rem",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} style={{ marginBottom: "24px" }}>
            {/* Email Input */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "var(--text)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.95rem",
                  transition: "all var(--transition-base)",
                  fontFamily: "inherit",
                }}
                placeholder="your@email.com"
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--primary)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: "28px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "var(--text)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    paddingRight: "44px",
                    border: "2px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.95rem",
                    transition: "all var(--transition-base)",
                    fontFamily: "inherit",
                  }}
                  placeholder="••••••••"
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--primary)";
                    e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--border)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    fontSize: "1.2rem",
                  }}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 24px",
                background: loading ? "var(--text-muted)" : "linear-gradient(135deg, var(--primary), var(--accent))",
                color: "white",
                border: "none",
                borderRadius: "var(--radius-sm)",
                fontWeight: "700",
                fontSize: "1rem",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all var(--transition-base)",
                opacity: loading ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                if (!loading) e.target.style.transform = "translateY(0)";
              }}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", margin: "24px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            <span style={{ padding: "0 12px", color: "var(--text-muted)", fontSize: "0.85rem" }}>OR</span>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          </div>

          {/* Footer */}
          <p style={{ textAlign: "center", color: "var(--text-light)", fontSize: "0.9rem" }}>
            Don't have an account?{" "}
            <Link
              href="/signup"
              style={{
                color: "var(--primary)",
                fontWeight: "700",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
              onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%" }}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p style={{ marginTop: "20px", textAlign: "center", color: "var(--text-light)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" style={{ color: "var(--primary)" }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
