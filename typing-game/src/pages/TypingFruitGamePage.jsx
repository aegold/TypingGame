import React from "react";
import { useNavigate } from "react-router-dom";
import TypingFruitGame from "../components/TypingFruitGame/index";
import "../styles/TypingFruitGamePage.css";

/**
 * TypingFruitGamePage Component
 * Page wrapper cho Typing Fruit Game
 */
function TypingFruitGamePage() {
  const navigate = useNavigate();

  /**
   * Xử lý khi game kết thúc
   */
  const handleGameOver = (result) => {
    console.log("Game Over - Score:", result.score);
    // Có thể thêm logic lưu điểm vào backend ở đây
  };

  return (
    <div className="typing-fruit-game-page">
      {/* Back button in top-left corner */}
      <button
        className="back-button-corner"
        onClick={() => navigate("/games")}
        title="Quay lại danh sách game"
      >
        ← Quay lại
      </button>

      <TypingFruitGame
        onGameOver={handleGameOver}
        // Có thể customize các props khác:
        // spawnRateMs={700}
        // maxActive={5}
        // gravity={1400}
        // letterPool="abcdefghijklmnopqrstuvwxyz"
        // startLives={3}
      />
    </div>
  );
}

export default TypingFruitGamePage;
