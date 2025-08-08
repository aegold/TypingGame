import React, { useState, useEffect, useRef } from "react";
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
  const [activeCategory, setActiveCategory] = useState("all"); // Category tab hiện tại
  const [showBackToTop, setShowBackToTop] = useState(false); // Hiển thị nút back to top
  const navigate = useNavigate();

  // === REFS FOR SMOOTH SCROLLING ===
  const categoryRefs = useRef({}); // Refs cho các category sections
  const uncategorizedRef = useRef(null); // Ref cho uncategorized section

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

  // === SCROLL DETECTION FOR BACK TO TOP ===
  useEffect(() => {
    const handleScroll = () => {
      // Hiển thị button khi scroll xuống > 300px
      setShowBackToTop(window.pageYOffset > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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

  // === CATEGORY NAVIGATION FUNCTIONS ===
  /**
   * Smooth scroll đến category section với offset cho navigation
   */
  const scrollToCategory = (categoryId) => {
    const targetRef =
      categoryId === "uncategorized"
        ? uncategorizedRef.current
        : categoryRefs.current[categoryId];

    if (targetRef) {
      // Tính toán offset để không bị che bởi navigation
      const yOffset = -80; // Offset 80px từ top
      const y =
        targetRef.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({
        top: y,
        behavior: "smooth",
      });
      setActiveCategory(categoryId);
    }
  };

  /**
   * Hiển thị tất cả và scroll về top
   */
  const handleShowAll = () => {
    setActiveCategory("all");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /**
   * Scroll về đầu trang (cho back to top button)
   */
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // === RENDER CONDITIONS ===
  if (loading) {
    return (
      <div className="page-content">
        <div className="lessons-page-bg">
          <div>Đang tải danh sách bài học...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content">
        <div className="lessons-page-bg">
          <div>Lỗi: {error}</div>
          <button onClick={() => window.location.reload()}>Thử lại</button>
        </div>
      </div>
    );
  }

  const { grouped, uncategorized } = groupLessonsByCategory();

  return (
    <div className="page-content no-padding">
      <div className="lessons-page-bg">
        <div className="lessons-page-container">
          <h1 className="lessons-title">Chọn bài học</h1>

          {/* === CATEGORY NAVIGATION TABS === */}
          <div className="category-navigation">
            <button
              className={`category-tab ${
                activeCategory === "all" ? "active" : ""
              }`}
              onClick={handleShowAll}
            >
              Tất cả
            </button>

            {uncategorized.length > 0 && (
              <button
                className={`category-tab ${
                  activeCategory === "uncategorized" ? "active" : ""
                }`}
                onClick={() => scrollToCategory("uncategorized")}
              >
                Chưa phân loại
              </button>
            )}

            {categories
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((category) => (
                <button
                  key={category._id}
                  className={`category-tab ${
                    activeCategory === category._id ? "active" : ""
                  }`}
                  onClick={() => scrollToCategory(category._id)}
                >
                  {category.name}
                </button>
              ))}
          </div>

          {/* Hiển thị uncategorized lessons trước */}
          {uncategorized.length > 0 && (
            <div
              className="category-section"
              ref={uncategorizedRef}
              id="category-uncategorized"
            >
              <h2 className="category-title">Chưa phân loại</h2>
              <div className="lessons-list">
                {uncategorized.map((lesson) => (
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
          )}

          {/* Hiển thị lessons theo category - luôn hiển thị tất cả categories */}
          {categories
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((category) => {
              const categoryLessons = grouped[category._id] || [];

              return (
                <div
                  key={category._id}
                  className="category-section"
                  ref={(el) => (categoryRefs.current[category._id] = el)}
                  id={`category-${category._id}`}
                >
                  <h2 className="category-title">{category.name}</h2>
                  {category.description && (
                    <p className="category-description">
                      {category.description}
                    </p>
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

        {/* === BACK TO TOP BUTTON === */}
        {showBackToTop && (
          <button
            className="back-to-top-btn"
            onClick={scrollToTop}
            title="Về đầu trang"
          >
            ↑
          </button>
        )}
      </div>
    </div>
  );
}

export default LessonsPage;
