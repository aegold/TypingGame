import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../styles/TypingGame.css";
import "../styles/LessonsPage.css";

function LessonsPage() {
  const [lessons, setLessons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch cả lessons và categories
        const [lessonsResponse, categoriesResponse] = await Promise.all([
          axios.get("/api/lessons"),
          axios.get("/api/categories"),
        ]);

        setLessons(lessonsResponse.data);
        setCategories(categoriesResponse.data);
        setError(null);
      } catch (err) {
        setError("Không thể tải danh sách bài học");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getGameTypeLabel = (type) => {
    switch (type) {
      case "letterTyper":
        return "Gõ chữ cái";
      case "wordTyper":
        return "Gõ từ";
      case "paragraphTyper":
        return "Gõ đoạn văn";
      default:
        return type;
    }
  };

  // Nhóm lessons theo category và sắp xếp
  const groupLessonsByCategory = () => {
    const grouped = {};
    const uncategorized = [];

    // Phân loại lessons
    lessons.forEach((lesson) => {
      if (lesson.category) {
        if (!grouped[lesson.category]) {
          grouped[lesson.category] = [];
        }
        grouped[lesson.category].push(lesson);
      } else {
        uncategorized.push(lesson);
      }
    });

    // Sắp xếp lessons trong mỗi category theo order
    Object.keys(grouped).forEach((categoryId) => {
      grouped[categoryId].sort((a, b) => (a.order || 0) - (b.order || 0));
    });

    // Sắp xếp uncategorized lessons theo order
    uncategorized.sort((a, b) => (a.order || 0) - (b.order || 0));

    return { grouped, uncategorized };
  };

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

  const { grouped, uncategorized } = groupLessonsByCategory();

  return (
    <div className="lessons-page-bg">
      <h1 className="lessons-title">Chọn bài học</h1>

      {/* Hiển thị uncategorized lessons trước */}
      {uncategorized.length > 0 && (
        <div className="category-section">
          <h2 className="category-title">Chưa phân loại</h2>
          <div className="lessons-list">
            {uncategorized.map((lesson) => (
              <div className="lesson-card" key={lesson._id}>
                <div className="lesson-title">{lesson.title}</div>
                <div className="lesson-info-box">
                  <span>Loại game: {getGameTypeLabel(lesson.gameType)}</span>
                  <p>Thời gian: {lesson.timer}s</p>
                </div>
                <button
                  className="lesson-play-btn"
                  onClick={() => navigate(`/lessons/${lesson._id}`)}
                >
                  Chơi
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hiển thị lessons theo category */}
      {categories
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((category) => {
          const categoryLessons = grouped[category._id] || [];
          if (categoryLessons.length === 0) return null;

          return (
            <div key={category._id} className="category-section">
              <h2 className="category-title">{category.name}</h2>
              {category.description && (
                <p className="category-description">{category.description}</p>
              )}
              <div className="lessons-list">
                {categoryLessons.map((lesson) => (
                  <div className="lesson-card" key={lesson._id}>
                    <div className="lesson-title">{lesson.title}</div>
                    <div className="lesson-info-box">
                      <span>
                        Loại game: {getGameTypeLabel(lesson.gameType)}
                      </span>
                      <p>Thời gian: {lesson.timer}s</p>
                    </div>
                    <button
                      className="lesson-play-btn"
                      onClick={() => navigate(`/lessons/${lesson._id}`)}
                    >
                      Chơi
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
    </div>
  );
}

export default LessonsPage;
