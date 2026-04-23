import { firebaseSetupError } from "../services/Firebase";

function SetupRequired() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        background:
          "linear-gradient(135deg, #f5f1e8 0%, #d9ecff 55%, #ffffff 100%)",
        color: "#1f2937",
      }}
    >
      <section
        style={{
          width: "min(680px, 100%)",
          background: "rgba(255, 255, 255, 0.9)",
          border: "1px solid #d1d5db",
          borderRadius: "20px",
          padding: "2rem",
          boxShadow: "0 20px 60px rgba(15, 23, 42, 0.08)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "0.9rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#0f766e",
          }}
        >
          Setup Required
        </p>
        <h1 style={{ margin: "0.75rem 0 0.5rem", fontSize: "2rem" }}>
          Firebase isn&apos;t configured for this frontend yet
        </h1>
        <p style={{ margin: "0 0 1rem", lineHeight: 1.6 }}>
          The app is loading without the Vite Firebase environment variables, so
          authentication cannot start.
        </p>
        <pre
          style={{
            margin: "0 0 1rem",
            padding: "1rem",
            borderRadius: "14px",
            background: "#111827",
            color: "#f9fafb",
            overflowX: "auto",
            fontSize: "0.95rem",
          }}
        >
          {firebaseSetupError}
        </pre>
        <p style={{ margin: "0 0 0.75rem", lineHeight: 1.6 }}>
          Create <code>.env</code> inside <code>prio-frontend/</code> using the
          values from your Firebase project settings. A starter template is in{" "}
          <code>prio-frontend/.env.example</code>.
        </p>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          After adding the values, restart the Vite dev server so the new env
          vars are picked up.
        </p>
      </section>
    </main>
  );
}

export default SetupRequired;
