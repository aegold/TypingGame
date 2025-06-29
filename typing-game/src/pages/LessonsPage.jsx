import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../styles/TypingGame.css";

function LessonsPage() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/lessons");
        setLessons(response.data);
        setError(null);
      } catch (err) {
        setError("Không thể tải danh sách bài học");
        console.error("Error fetching lessons:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  if (loading) {
    return (
      <div className="lessons-page-bg">
        <div>Đang tải danh sách bài học...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lessons-page-bg">
        <div>Lỗi: {error}</div>
        <button onClick={() => window.location.reload()}>Thử lại</button>
      </div>
    );
  }

  return (
    <div className="lessons-page-bg">
      <h1 className="lessons-title">Chọn bài học</h1>
      <div className="lessons-list">
        {lessons.map((lesson) => (
          <div className="lesson-card" key={lesson._id}>
            <div className="lesson-title">{lesson.title}</div>
            <div className="lesson-info">
              <span className="lesson-type">Loại game: {lesson.gameType}</span>
              <span className="lesson-timer">Thời gian: {lesson.timer}s</span>
            </div>
            <button
              className="lesson-detail-btn"
              onClick={() => navigate(`/lessons/${lesson._id}`)}
            >
              Chơi
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LessonsPage;
