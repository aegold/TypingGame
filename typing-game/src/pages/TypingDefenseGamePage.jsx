import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import TypingDefenseGame from "../components/TypingDefenseGame";
import axios from "../api/axios";
import { toast } from "react-toastify";
import "../styles/TypingDefenseGamePage.css";

/**
 * TypingDefenseGamePage Component
 * Trang hiển thị trò chơi đánh chữ 2D
 */
function TypingDefenseGamePage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);

  /**
   * Xử lý khi game kết thúc
   * Lưu điểm số nếu user đã đăng nhập
   */
  const handleGameOver = async (finalScore) => {
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

      await axios.post(
        "/api/score",
        {
          lessonId: "typing-defense-game",
          score: finalScore,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(`Điểm số ${finalScore} đã được lưu!`);
    } catch (error) {
      console.error("Error saving score:", error);
      toast.error("Không thể lưu điểm số. Vui lòng thử lại!");
    } finally {
      setIsSubmittingScore(false);
    }
  };

  /**
   * Xử lý cập nhật điểm số real-time (optional)
   */
  const handleScoreUpdate = (currentScore) => {
    // Có thể dùng để hiển thị live score hoặc achievements
    console.log("Current score:", currentScore);
  };

  return (
    <div className="typing-defense-game-page">
      {/* Back button in top-left corner */}
      <button
        className="back-button-corner"
        onClick={() => navigate("/games")}
        title="Quay lại danh sách game"
      >
        ← Quay lại
      </button>

      {/* Game Component - Full focus */}
      <TypingDefenseGame
        onGameOver={handleGameOver}
        onScoreUpdate={handleScoreUpdate}
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

export default TypingDefenseGamePage;
