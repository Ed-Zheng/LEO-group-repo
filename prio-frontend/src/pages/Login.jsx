import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "28px",
        display: "grid",
        placeItems: "center",
      }}
    >
      <section
        style={{
          width: "min(1100px, 100%)",
          display: "grid",
          gridTemplateColumns: "1.05fr 0.95fr",
          gap: 22,
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(160deg, rgba(233, 241, 237, 0.95) 0%, rgba(248, 245, 239, 0.98) 100%)",
            border: "1px solid var(--border-soft)",
            borderRadius: 30,
            boxShadow: "var(--shadow-soft)",
            padding: "38px 36px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: 620,
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "var(--text-muted)",
                fontWeight: 700,
              }}
            >
              Priority Workspace
            </p>
            <h1
              style={{
                margin: "18px 0 14px",
                fontSize: "clamp(2.9rem, 5vw, 4.8rem)",
                lineHeight: 0.95,
                letterSpacing: "-0.07em",
                color: "var(--text-strong)",
              }}
            >
              Welcome
              <br />
              back.
            </h1>
            <p
              style={{
                margin: 0,
                maxWidth: 440,
                fontSize: 17,
                lineHeight: 1.7,
                color: "var(--text-body)",
              }}
            >
              Keep projects calm, visible, and moving. Sign in to review tasks,
              message teammates, and stay ahead of deadlines without the clutter.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 14,
            }}
          >
            <FeatureCard
              eyebrow="Clearer Work"
              text="A focused dashboard that keeps priorities readable at a glance."
            />
            <FeatureCard
              eyebrow="Team Signals"
              text="Messages, notifications, and notes tied directly to each task."
            />
          </div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.94)",
            border: "1px solid var(--border-soft)",
            borderRadius: 30,
            boxShadow: "var(--shadow-soft)",
            padding: "38px 34px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={{ maxWidth: 420, width: "100%", margin: "0 auto" }}>
            <div style={{ marginBottom: 26 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "var(--text-muted)",
                  fontWeight: 700,
                }}
              >
                Sign In
              </p>
              <h2
                style={{
                  margin: "10px 0 8px",
                  fontSize: 34,
                  lineHeight: 1.05,
                  letterSpacing: "-0.05em",
                  color: "var(--text-strong)",
                }}
              >
                Access your workspace
              </h2>
              <p style={{ margin: 0, color: "var(--text-body)", lineHeight: 1.6 }}>
                Use your account details to continue where you left off.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
              <label style={fieldWrapStyle}>
                <span style={fieldLabelStyle}>Email</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  style={inputStyle}
                />
              </label>

              <label style={fieldWrapStyle}>
                <span style={fieldLabelStyle}>Password</span>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  style={inputStyle}
                />
              </label>

              {error ? (
                <div
                  style={{
                    borderRadius: 16,
                    background: "var(--danger-soft)",
                    color: "var(--danger-text)",
                    padding: "12px 14px",
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                >
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 4,
                  borderRadius: 999,
                  border: "none",
                  background: "var(--accent-deep)",
                  color: "#fff",
                  padding: "13px 18px",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Logging in..." : "Log In"}
              </button>
            </form>

            <div
              style={{
                marginTop: 22,
                paddingTop: 18,
                borderTop: "1px solid var(--border-soft)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 14,
                flexWrap: "wrap",
              }}
            >
              <p style={{ margin: 0, color: "var(--text-body)" }}>
                Don&apos;t have an account yet?
              </p>
              <button
                type="button"
                onClick={() => navigate("/signup")}
                style={{
                  borderRadius: 999,
                  background: "var(--accent-soft)",
                  color: "var(--accent-deep)",
                  padding: "11px 16px",
                  fontWeight: 700,
                }}
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ eyebrow, text }) {
  return (
    <div
      style={{
        borderRadius: 20,
        background: "rgba(255,255,255,0.72)",
        border: "1px solid rgba(108, 128, 123, 0.12)",
        padding: "18px 18px 20px",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "var(--text-muted)",
          fontWeight: 700,
        }}
      >
        {eyebrow}
      </p>
      <p
        style={{
          margin: "10px 0 0",
          color: "var(--text-body)",
          lineHeight: 1.65,
          fontSize: 14,
        }}
      >
        {text}
      </p>
    </div>
  );
}

const fieldWrapStyle = {
  display: "grid",
  gap: 8,
};

const fieldLabelStyle = {
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--text-muted)",
  fontWeight: 700,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  borderRadius: 16,
  border: "1px solid var(--border-soft)",
  background: "var(--surface-panel-strong)",
  color: "var(--text-strong)",
  padding: "14px 16px",
  fontSize: 15,
  outline: "none",
};
