/**
 * Reusable badge components for task metadata display.
 * All are purely presentational — no state or side effects.
 */

// ─── Priority ────────────────────────────────────────────────────────────────

const PRIORITY = {
  high:   { label: "High",   color: "#ef4444", bg: "#fef2f2", dot: "#ef4444" },
  medium: { label: "Medium", color: "#f59e0b", bg: "#fffbeb", dot: "#f59e0b" },
  low:    { label: "Low",    color: "#22c55e", bg: "#f0fdf4", dot: "#22c55e" },
};

/**
 * PriorityBadge
 * Props: priority – "high" | "medium" | "low"
 *        size     – "sm" | "md" (default "md")
 */
export function PriorityBadge({ priority, size = "md" }) {
  const cfg = PRIORITY[priority] ?? PRIORITY.medium;
  const fontSize = size === "sm" ? "10px" : "11px";
  const padding  = size === "sm" ? "1px 6px" : "3px 9px";

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize, fontWeight: 600, padding, borderRadius: 99,
      color: cfg.color, background: cfg.bg,
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

// ─── Status ──────────────────────────────────────────────────────────────────

const STATUS = {
  pending:     { label: "Pending",     color: "#6b7280", bg: "#f3f4f6" },
  in_progress: { label: "In Progress", color: "#3b82f6", bg: "#eff6ff" },
  completed:   { label: "Completed",   color: "#10b981", bg: "#ecfdf5" },
};

/**
 * StatusBadge
 * Props: status – "pending" | "in_progress" | "completed"
 *        size   – "sm" | "md"
 */
export function StatusBadge({ status, size = "md" }) {
  const cfg = STATUS[status] ?? STATUS.pending;
  const fontSize = size === "sm" ? "10px" : "11px";
  const padding  = size === "sm" ? "1px 6px" : "3px 9px";

  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      fontSize, fontWeight: 500, padding, borderRadius: 99,
      color: cfg.color, background: cfg.bg, whiteSpace: "nowrap",
    }}>
      {cfg.label}
    </span>
  );
}

// ─── Deadline ─────────────────────────────────────────────────────────────────

/**
 * DeadlineBadge
 * Props: deadline – ISO date string
 *        status   – task status (used to suppress overdue styling if completed)
 *        size     – "sm" | "md"
 */
export function DeadlineBadge({ deadline, status, size = "md" }) {
  if (!deadline) return null;

  const date     = new Date(deadline);
  const now      = new Date();
  const diffMs   = date - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const isOverdue = diffMs < 0 && status !== "completed";
  const isDueSoon = diffDays >= 0 && diffDays <= 2 && status !== "completed";

  const color = isOverdue  ? "#ef4444"
              : isDueSoon  ? "#f59e0b"
              : "#6b7280";
  const bg    = isOverdue  ? "#fef2f2"
              : isDueSoon  ? "#fffbeb"
              : "#f9fafb";

  const formatted = date.toLocaleDateString("en-US", {
    month: "short", day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });

  const label = isOverdue        ? `Overdue · ${formatted}`
              : diffDays === 0   ? "Due today"
              : diffDays === 1   ? "Due tomorrow"
              : formatted;

  const fontSize = size === "sm" ? "10px" : "11px";
  const padding  = size === "sm" ? "1px 6px" : "3px 9px";

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize, fontWeight: isOverdue || isDueSoon ? 600 : 400,
      padding, borderRadius: 99, color, background: bg, whiteSpace: "nowrap",
    }}>
      {isOverdue ? "⚠ " : "📅 "}{label}
    </span>
  );
}
