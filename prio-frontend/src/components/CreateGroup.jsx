import { useState } from "react";

export default function CreateGroup({ onCreate }) {
  const [groupName, setGroupName] = useState("");

  return (
    <div style={{ marginBottom: "15px" }}>
      <input
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        placeholder="Enter group name"
      />
      <button onClick={() => onCreate(groupName)}>
        Create Group
      </button>
    </div>
  );
}