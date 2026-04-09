import { useState } from "react";

export default function JoinGroup({ onJoin }) {
  const [inviteCode, setInviteCode] = useState("");

  return (
    <div style={{ marginBottom: "15px" }}>
      <input
        value={inviteCode}
        onChange={(e) => setInviteCode(e.target.value)}
        placeholder="Invite code"
      />
      <button onClick={() => onJoin(inviteCode)}>
        Join Group
      </button>
    </div>
  );
}