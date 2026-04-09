export default function GroupMembers({ members }) {
  return (
    <div>
      <h3 style={{ color: "#f9fafb" }}>Group Members</h3>
      {members.length === 0 ? (
        <p style={{ color: "#9ca3af" }}>No group members yet.</p>
      ) : (
        <ul style={{ color: "#e5e7eb" }}>
          {members.map((member) => (
            <li key={member.uid}>
              {member.displayName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}