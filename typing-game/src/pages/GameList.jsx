import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/GameList.css";

/**
 * GameList Component
 * Trang hiển thị danh sách các trò chơi có sẵn
 */
function GameList() {
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
    <div className="games-page">
      {/* Header */}
      <div className="games-header">
        <h1 className="games-title">🎮 Trò chơi Gõ phím</h1>
        <p className="games-subtitle">
          Chọn trò chơi phù hợp để luyện tập kỹ năng đánh máy một cách vui nhộn!
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
            {/* Game Info */}
            <div className="game-info">
              <h3 className="game-title">{game.title}</h3>
              <p className="game-description">{game.description}</p>
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
    </div>
  );
}

export default GameList;
