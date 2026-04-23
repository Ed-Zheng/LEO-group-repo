import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./services/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SignUp from "./pages/SignUp";
import TaskDetails from "./pages/TaskDetails";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/tasks/:taskId" element={<TaskDetails />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;