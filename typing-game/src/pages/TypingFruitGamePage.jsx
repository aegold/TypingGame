import React from "react";
import TypingFruitGame from "../components/TypingFruitGame";

/**
 * TypingFruitGamePage Component
 * Page wrapper cho Typing Fruit Game
 */
function TypingFruitGamePage() {
  /**
   * Xử lý khi game kết thúc
   */
  const handleGameOver = (result) => {
    console.log("Game Over - Score:", result.score);
    // Có thể thêm logic lưu điểm vào backend ở đây
  };

  return (
    <div className="typing-fruit-game-page">
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
