import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>Prio</h1>
      <p>Organize priorities. Collaborate clearly.</p>

      <button onClick={() => navigate("/login")}>
        Get Started
      </button>
    </div>
  );
}