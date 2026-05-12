import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        router.push("/");
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
      </Head>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)",
          padding: "20px",
        }}
      >
        <div className="card" style={{ maxWidth: "400px", width: "100%" }}>
          <h1
            style={{
              fontSize: "2rem",
              color: "var(--primary)",
              marginBottom: "10px",
              textAlign: "center",
            }}
          >
            📚 Study Assistant
          </h1>
          <p style={{ color: "var(--text-light)", marginBottom: "30px", textAlign: "center" }}>
            Login to continue
          </p>

          {error && (
            <div
              style={{
                background: "#fee",
                color: "#c33",
                padding: "10px",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
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
            Don't have an account?{" "}
            <Link href="/signup" style={{ color: "var(--primary)" }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
