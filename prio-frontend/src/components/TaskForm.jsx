import { useState } from "react";

const PRIORITIES = ["low", "medium", "high"];
const STATUSES = ["pending", "in_progress", "completed"];

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  fontSize: "14px",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  outline: "none",
  color: "#111827",
  background: "#fff",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.15s",
};

const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: 6,
};

/**
 * TaskForm
 * Props:
 *   initialData  – task object for editing (null → create mode)
 *   onSubmit     – (taskData) => Promise<void>
 *   onCancel     – () => void
 *   groupMembers – [{ uid, displayName, email }]  for assignee picker
 */
export default function TaskForm({
  initialData = null,
  onSubmit,
  onCancel,
  groupMembers = [],
  lockedAssigneeIds = [],
  fixedParentTaskId = null,
}) {
  const isEdit = Boolean(initialData);
  const isSubtaskMode = Boolean(fixedParentTaskId);

  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    priority: initialData?.priority ?? "medium",
    status: initialData?.status ?? "pending",
    deadline: initialData?.deadline ?? "",
    assigneeIds: initialData?.assignees?.map((a) => a.uid) ?? [],
    isMajorTask: initialData?.isMajorTask ?? false,
    parentTaskId: initialData?.parentTaskId ?? null,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required.";
    if (form.deadline && isNaN(new Date(form.deadline))) errs.deadline = "Invalid date.";
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const finalAssigneeIds = Array.from(
        new Set([...(form.assigneeIds || []), ...lockedAssigneeIds])
      );

      await onSubmit?.({
        ...form,
        title: form.title.trim(),
        deadline: form.deadline || null,
        assigneeIds: finalAssigneeIds,
        assignees: groupMembers.filter((m) => finalAssigneeIds.includes(m.uid)),
        isMajorTask: isSubtaskMode ? false : form.isMajorTask,
        parentTaskId: isSubtaskMode ? fixedParentTaskId : form.parentTaskId,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAssignee = (uid) => {
    const isLocked = lockedAssigneeIds.includes(uid);
    if (isLocked && form.assigneeIds.includes(uid)) {
      return;
    }

    set(
      "assigneeIds",
      form.assigneeIds.includes(uid)
        ? form.assigneeIds.filter((id) => id !== uid)
        : [...form.assigneeIds, uid]
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Title */}
      <div>
        <label style={labelStyle}>Title *</label>
        <input
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Task title"
          style={{ ...inputStyle, borderColor: errors.title ? "#ef4444" : "#e5e7eb" }}
          onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
          onBlur={(e) =>
            (e.target.style.borderColor = errors.title ? "#ef4444" : "#e5e7eb")
          }
        />
        {errors.title && (
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#ef4444" }}>
            {errors.title}
          </p>
        )}
      </div>

      {/* Description */}
      {!isSubtaskMode && (
        <div>
          <label style={labelStyle}>Task Type</label>
          <button
            type="button"
            onClick={() => set("isMajorTask", !form.isMajorTask)}
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: form.isMajorTask ? "#4f46e5" : "#374151",
              color: "white",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {form.isMajorTask ? "Major Task: On" : "Make Major Task"}
          </button>
        </div>
      )}

      <div>
        <label style={labelStyle}>Description</label>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Optional details…"
          rows={3}
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
          onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
          onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
        />
      </div>

      {/* Priority + Status */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <label style={labelStyle}>Priority</label>
          <select
            value={form.priority}
            onChange={(e) => set("priority", e.target.value)}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Status</label>
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Deadline */}
      <div>
        <label style={labelStyle}>Deadline</label>
        <input
          type="date"
          value={form.deadline}
          onChange={(e) => set("deadline", e.target.value)}
          style={{ ...inputStyle, borderColor: errors.deadline ? "#ef4444" : "#e5e7eb" }}
          onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
          onBlur={(e) =>
            (e.target.style.borderColor = errors.deadline ? "#ef4444" : "#e5e7eb")
          }
        />
        {errors.deadline && (
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#ef4444" }}>
            {errors.deadline}
          </p>
        )}
      </div>

      {/* Assignees */}
      <div>
        <label style={labelStyle}>Assign to</label>

        {groupMembers.length === 0 ? (
          <p style={{ fontSize: "13px", color: "#6b7280" }}>
            No teammates available. Join or create a group first.
          </p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {groupMembers.map((member) => {
              const selected = form.assigneeIds.includes(member.uid);
              const locked = lockedAssigneeIds.includes(member.uid) && selected;

              return (
                <button
                  key={member.uid}
                  type="button"
                  onClick={() => toggleAssignee(member.uid)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "5px 10px",
                    borderRadius: 99,
                    border: `1.5px solid ${selected ? "#3b82f6" : "#e5e7eb"}`,
                    background: selected ? "#eff6ff" : "#fff",
                    color: selected ? "#3b82f6" : "#374151",
                    fontSize: "13px",
                    cursor: locked ? "not-allowed" : "pointer",
                    fontWeight: selected ? 600 : 400,
                    transition: "all 0.15s",
                    opacity: locked ? 0.75 : 1,
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: `hsl(${(member.displayName?.charCodeAt(0) ?? 65) * 10}, 55%, 55%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "9px",
                      fontWeight: 700,
                      color: "#fff",
                    }}
                  >
                    {(member.displayName ?? member.email ?? "?")[0].toUpperCase()}
                  </div>
                  {member.displayName ?? member.email}
                  {locked ? " (locked)" : ""}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
        <button
          onClick={onCancel}
          style={{
            padding: "9px 18px",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            background: "#fff",
            color: "#374151",
            fontSize: "14px",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            padding: "9px 20px",
            borderRadius: 8,
            border: "none",
            background: submitting ? "#93c5fd" : "#3b82f6",
            color: "#fff",
            fontSize: "14px",
            cursor: submitting ? "not-allowed" : "pointer",
            fontWeight: 600,
            transition: "background 0.15s",
          }}
        >
          {submitting ? "Saving…" : isEdit ? "Save changes" : "Create task"}
        </button>
      </div>
    </div>
  );
}
