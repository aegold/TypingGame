import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import TypingFruitGame from "../components/TypingFruitGame/index";
import axios from "../api/axios";
import { toast } from "react-toastify";
import "../styles/TypingFruitGamePage.css";

/**
 * TypingFruitGamePage Component
 * Page wrapper cho Typing Fruit Game
 */
function TypingFruitGamePage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);

  /**
   * Xử lý khi game kết thúc
   * Lưu điểm số và thống kê vào arcade leaderboard nếu user đã đăng nhập
   */
  const handleGameOver = async (finalScore, stats = {}) => {
    if (!isLoggedIn) {
      toast.info("Đăng nhập để lưu điểm số!");
      return;
    }

    if (finalScore <= 0) {
      return;
    }

    try {
      setIsSubmittingScore(true);
      const token = localStorage.getItem("token");

      // Submit to arcade leaderboard API with stats
      await axios.post(
        "/api/arcade/score",
        {
          gameType: "fruit",
          score: finalScore,
          stats: {
            accuracy: stats.accuracy || 0,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(
        `Đã lưu điểm! (Độ chính xác: ${stats.accuracy?.toFixed(1)}%)`
      );
    } catch (error) {
      console.error("Error saving score:", error);
      toast.error("Không thể lưu điểm số. Vui lòng thử lại!");
    } finally {
      setIsSubmittingScore(false);
    }
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

      {/* Loading indicator when submitting score */}
      {isSubmittingScore && (
        <div className="score-saving">
          <div className="loading-spinner"></div>
          <span>Đang lưu điểm số...</span>
        </div>
      )}
    </div>
  );
}

export default TypingFruitGamePage;
