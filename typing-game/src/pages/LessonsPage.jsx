import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../styles/TypingGame.css";
import "../styles/LessonsPage.css";

/**
 * LessonsPage Component
 * Trang hiển thị danh sách bài học được phân loại theo categories
 * User có thể chọn bài học để chơi
 */
function LessonsPage() {
  // === STATE MANAGEMENT ===
  const [lessons, setLessons] = useState([]); // Danh sách tất cả bài học
  const [categories, setCategories] = useState([]); // Danh sách categories
  const [loading, setLoading] = useState(true); // Trạng thái loading
  const [error, setError] = useState(null); // Thông báo lỗi
  const navigate = useNavigate();

  // === DATA FETCHING ===
  /**
   * Fetch data khi component mount
   * Lấy cả lessons và categories cùng lúc để hiển thị
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch cả lessons và categories cùng lúc
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

  // === UTILITY FUNCTIONS ===
  /**
   * Chuyển đổi gameType thành label hiển thị
   */
  const getGameTypeLabel = (type) => {
    switch (type) {
      case "letterTyper":
        return "Gõ chữ cái";
      case "wordTyper":
        return "Gõ từ";
      case "paragraphTyper":
        return "Gõ đoạn văn";
      case "vietnameseLetterTyper":
        return "Gõ ký tự tiếng Việt";
      default:
        return type;
    }
  };

  /**
   * Nhóm lessons theo category và sắp xếp
   * Trả về object với lessons được grouped và lessons chưa có category
   */
  const groupLessonsByCategory = () => {
    const grouped = {}; // {categoryId: [lessons]}
    const uncategorized = []; // Lessons không có category

    // Phân loại lessons theo category
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

  // === RENDER CONDITIONS ===
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
      <div className="lessons-page-container">
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

        {/* Hiển thị lessons theo category - luôn hiển thị tất cả categories */}
        {categories
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((category) => {
            const categoryLessons = grouped[category._id] || [];

            return (
              <div key={category._id} className="category-section">
                <h2 className="category-title">{category.name}</h2>
                {category.description && (
                  <p className="category-description">{category.description}</p>
                )}
                <div className="lessons-list">
                  {categoryLessons.length === 0 ? (
                    <div className="no-lessons-message">
                      Chưa có bài học nào trong danh mục này.
                    </div>
                  ) : (
                    categoryLessons.map((lesson) => (
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
                    ))
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default LessonsPage;
