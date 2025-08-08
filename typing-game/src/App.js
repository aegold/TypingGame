import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/Navbar.css";
import LoginPage from "./pages/LoginPage";
import GamePage from "./pages/GamePage";
import Dashboard from "./pages/Dashboard";
import RegisterPage from "./pages/RegisterPage";
import LessonsPage from "./pages/LessonsPage";
import LessonDetail from "./pages/LessonDetail";
import AdminDashboard from "./pages/AdminDashboard";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./contexts/AuthContext";
import LeaderboardPage from "./pages/LeaderboardPage";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/lessons" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/game/:id" element={<GamePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/lessons" element={<LessonsPage />} />
          <Route path="/lessons/:id" element={<LessonDetail />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>

        {/* Toast Container với custom styling */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          toastStyle={{
            fontSize: "14px",
            borderRadius: "8px",
          }}
        />
      </div>
    </AuthProvider>
  );
}

export default App;
