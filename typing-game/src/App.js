import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import GamePage from "./pages/GamePage";
import Dashboard from "./pages/Dashboard";
import RegisterPage from "./pages/RegisterPage";
import LessonsPage from "./pages/LessonsPage";
import LessonDetail from "./pages/LessonDetail";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/game/:id" element={<GamePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/lessons" element={<LessonsPage />} />
          <Route path="/lessons/:id" element={<LessonDetail />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
