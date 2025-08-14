import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/GamesPage.css";

/**
 * GamesPage Component
 * Trang hiển thị danh sách các trò chơi có sẵn
 */
function GamesPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  // Danh sách game
  const games = [
    {
      id: "typing-defense",
      title: "Typing Defense",
      description:
        "Bảo vệ bằng cách gõ từ! Tiêu diệt kẻ địch rơi từ trên trời.",
      icon: "🛡️",
      difficulty: "Dễ",
      ageGroup: "5+ tuổi",
      skills: ["Tốc độ gõ", "Phản xạ", "Từ vựng"],
      path: "/typing-defense",
      isAvailable: true,
      isNew: true,
    },
    {
      id: "word-rain",
      title: "Word Rain",
      description: "Gõ từ rơi như mưa trước khi chúng chạm đất.",
      icon: "🌧️",
      difficulty: "Trung bình",
      ageGroup: "8+ tuổi",
      skills: ["Tốc độ gõ", "Tập trung", "Chính tả"],
      path: "/word-rain",
      isAvailable: false,
      isNew: false,
    },
    {
      id: "typing-race",
      title: "Typing Race",
      description: "Đua xe bằng cách gõ từ nhanh và chính xác.",
      icon: "🏎️",
      difficulty: "Khó",
      ageGroup: "10+ tuổi",
      skills: ["Tốc độ gõ", "Chính xác", "Áp lực"],
      path: "/typing-race",
      isAvailable: false,
      isNew: false,
    },
    {
      id: "letter-hero",
      title: "Letter Hero",
      description: "Trở thành siêu anh hùng của bảng chữ cái!",
      icon: "🦸",
      difficulty: "Dễ",
      ageGroup: "4+ tuổi",
      skills: ["Nhận biết chữ", "Phản xạ", "Tập trung"],
      path: "/letter-hero",
      isAvailable: false,
      isNew: false,
    },
  ];

  /**
   * Xử lý khi click vào game
   */
  const handleGameClick = (game) => {
    if (game.isAvailable) {
      navigate(game.path);
    }
  };

  return (
    <div className="page-content">
      <div className="games-page">
        {/* Header */}
        <div className="games-header">
          <h1 className="games-title">🎮 Trò chơi Gõ phím</h1>
          <p className="games-subtitle">
            Chọn trò chơi phù hợp để luyện tập kỹ năng đánh máy một cách vui
            nhộn!
          </p>
          {!isLoggedIn && (
            <div className="login-reminder">
              <span>💡 </span>
              <button className="login-link" onClick={() => navigate("/login")}>
                Đăng nhập
              </button>{" "}
              để lưu điểm số và theo dõi tiến độ!
            </div>
          )}
        </div>

        {/* Games Grid */}
        <div className="games-grid">
          {games.map((game) => (
            <div
              key={game.id}
              className={`game-card ${!game.isAvailable ? "disabled" : ""}`}
              onClick={() => handleGameClick(game)}
            >
              {/* Game Status Badges */}
              <div className="game-badges">
                {game.isNew && <span className="badge new">Mới</span>}
                {!game.isAvailable && (
                  <span className="badge coming-soon">Sắp ra mắt</span>
                )}
              </div>

              {/* Game Icon */}
              <div className="game-icon">{game.icon}</div>

              {/* Game Info */}
              <div className="game-info">
                <h3 className="game-title">{game.title}</h3>
                <p className="game-description">{game.description}</p>

                <div className="game-details">
                  <div className="detail-item">
                    <span className="detail-label">Độ khó:</span>
                    <span
                      className={`difficulty ${game.difficulty.toLowerCase()}`}
                    >
                      {game.difficulty}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Độ tuổi:</span>
                    <span className="age-group">{game.ageGroup}</span>
                  </div>
                </div>

                <div className="skills-list">
                  <span className="skills-label">Kỹ năng:</span>
                  <div className="skills">
                    {game.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Play Button */}
              <div className="game-action">
                {game.isAvailable ? (
                  <button className="play-button">Chơi ngay</button>
                ) : (
                  <button className="disabled-button" disabled>
                    Sắp ra mắt
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="games-info">
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon">🎯</div>
              <h3>Mục tiêu</h3>
              <p>
                Cải thiện tốc độ và độ chính xác khi đánh máy thông qua các trò
                chơi thú vị
              </p>
            </div>
            <div className="info-card">
              <div className="info-icon">📈</div>
              <h3>Tiến độ</h3>
              <p>
                Theo dõi sự tiến bộ qua điểm số và thống kê chi tiết của từng
                trò chơi
              </p>
            </div>
            <div className="info-card">
              <div className="info-icon">🏆</div>
              <h3>Thành tích</h3>
              <p>Cạnh tranh với bạn bè và leo lên bảng xếp hạng toàn cầu</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GamesPage;
