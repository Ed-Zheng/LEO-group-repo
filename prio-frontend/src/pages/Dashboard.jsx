<div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    marginBottom: "20px",
  }}
>
  {/* Team Collaboration Section */}
  <div
    style={{
      backgroundColor: "#374151",
      padding: "20px",
      borderRadius: "10px",
    }}
  >
    <h2 style={{ color: "#f9fafb", marginBottom: "15px" }}>
      Team Collaboration
    </h2>

    <CreateGroup
      onCreate={(newGroup) => {
        console.log("Created group:", newGroup);
      }}
    />

    <JoinGroup
      onJoin={(joinedGroup) => {
        console.log("Joined group:", joinedGroup);

        // temporary mock teammates until backend is ready
        setGroupMembers([
          {
            uid: "101",
            displayName: "Alex",
            email: "alex@email.com",
          },
          {
            uid: "102",
            displayName: "Sarah",
            email: "sarah@email.com",
          },
          {
            uid: user.uid,
            displayName: "You",
            email: user.email,
          },
        ]);
      }}
    />

    <GroupMembers members={groupMembers} />
  </div>

  {/* Tasks Header */}
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 16,
    }}
  >
    <div>
      <h2
        style={{
          color: "var(--text-strong)",
          margin: 0,
          fontSize: 22,
          letterSpacing: "-0.03em",
        }}
      >
        Your Tasks
      </h2>
      <p style={{ margin: "6px 0 0", color: "var(--text-muted)" }}>
        Personal and shared work, organized in one place.
      </p>
    </div>

    <button
      onClick={() => setShowForm(!showForm)}
      style={{
        padding: "11px 16px",
        backgroundColor: "var(--accent-deep)",
        color: "#ffffff",
        border: "none",
        borderRadius: "999px",
        cursor: "pointer",
        fontWeight: 700,
        boxShadow: "0 6px 14px rgba(53, 83, 84, 0.1)",
      }}
    >
      + Create Task
    </button>
  </div>
</div>