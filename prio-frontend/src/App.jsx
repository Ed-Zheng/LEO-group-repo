import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./services/AuthContext";
import { firebaseSetupError } from "./services/Firebase";
import SetupRequired from "./components/SetupRequired";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TaskDetails from "./pages/TaskDetails";
import SignUp from "./pages/SignUp";
import TaskDetails from "./pages/TaskDetails";

function App() {
  if (firebaseSetupError) {
    return <SetupRequired />;
  }

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks/:id" element={<TaskDetails />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/tasks/:taskId" element={<TaskDetails />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
