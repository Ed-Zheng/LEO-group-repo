import { useState, useRef, useEffect } from "react";

const OPTIONS = [
  { value: "pending",     label: "Pending",     color: "#6b7280", bg: "#f3f4f6" },
  { value: "in_progress", label: "In Progress", color: "#3b82f6", bg: "#eff6ff" },
  { value: "completed",   label: "Completed",   color: "#10b981", bg: "#ecfdf5" },
];

/**
 * StatusDropdown
 * Props:
 *   value     – current status string
 *   onChange  – (newStatus: string) => void
 *   disabled  – boolean
 */
export default function StatusDropdown({ value, onChange, disabled = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = OPTIONS.find(o => o.value === value) ?? OPTIONS[0];

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => !disabled && setOpen(v => !v)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 10px 5px 10px", borderRadius: 8,
          border: `1px solid ${open ? current.color : "#e5e7eb"}`,
          background: current.bg, color: current.color,
          fontSize: "13px", fontWeight: 500, cursor: disabled ? "default" : "pointer",
          transition: "border-color 0.15s",
          outline: "none",
        }}
      >
        {current.label}
        {!disabled && (
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none"
            style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 50,
          background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)", overflow: "hidden", minWidth: 150,
        }}>
          {OPTIONS.map(opt => (
            <button key={opt.value}
              onClick={() => { onChange?.(opt.value); setOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                width: "100%", textAlign: "left", padding: "9px 14px",
                background: opt.value === value ? opt.bg : "none",
                border: "none", cursor: "pointer",
                fontSize: "13px", color: opt.value === value ? opt.color : "#374151",
                fontWeight: opt.value === value ? 600 : 400,
                transition: "background 0.1s",
              }}
              onMouseEnter={e => { if (opt.value !== value) e.currentTarget.style.background = "#f9fafb"; }}
              onMouseLeave={e => { if (opt.value !== value) e.currentTarget.style.background = "none"; }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: opt.color, flexShrink: 0 }} />
              {opt.label}
              {opt.value === value && <span style={{ marginLeft: "auto", fontSize: "12px" }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
