import { Link } from "react-router-dom";
import NotificationBell from "./NotificationBell";

export default function Navbar({ userId }) {
  return (
    <nav
      style={{
        position: "relative",
        zIndex: 60,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
        padding: "18px 22px",
        borderRadius: 22,
        border: "1px solid var(--border-soft)",
        background: "rgba(255,255,255,0.92)",
        boxShadow: "var(--shadow-soft)",
      }}
    >
      <div>
        <Link to="/dashboard" style={{ textDecoration: "none", color: "var(--text-strong)" }}>
          <h2 style={{ margin: 0, fontSize: 30, letterSpacing: "-0.04em" }}>Prio</h2>
        </Link>
        <p style={{ margin: "6px 0 0", color: "var(--text-muted)", fontSize: 14 }}>
          Shared work, clean priorities.
        </p>
      </div>
      <NotificationBell userId={userId} />
    </nav>
  );
}
