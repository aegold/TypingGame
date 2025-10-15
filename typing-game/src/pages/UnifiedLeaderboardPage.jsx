import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "../api/axios";
import { toast } from "react-toastify";
import "../styles/UnifiedLeaderboardPage.css";

/**
 * UnifiedLeaderboardPage Component
 * Gộp chung bảng xếp hạng cho Lessons và Arcade Games (Defense, Fruit)
 */
function UnifiedLeaderboardPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  // Tab state: 'lessons' | 'defense' | 'fruit'
  const [activeTab, setActiveTab] = useState("lessons");

  // Time filter: 'all' | 'month' | 'day'
  const [timeFilter, setTimeFilter] = useState("all");

  // Limit (chỉ dùng cho tab lessons)
  const [limit, setLimit] = useState(10);

  // Data state
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserData, setCurrentUserData] = useState(null); // Thông tin user hiện tại (lessons only)
  const [loading, setLoading] = useState(false);

  /**
   * Fetch leaderboard data dựa vào activeTab
   */
  const fetchLeaderboard = async () => {
    setLoading(true);
    setCurrentUserData(null);

    try {
      if (activeTab === "lessons") {
        // Fetch lessons leaderboard
        const token = isLoggedIn ? localStorage.getItem("token") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await axios.get("/api/leaderboard", {
          params: { limit, period: timeFilter },
          headers,
        });

        setLeaderboard(response.data.leaderboard || []);
        setCurrentUserData(response.data.me || null);
      } else {
        // Fetch arcade leaderboard (defense or fruit)
        const response = await axios.get(
          `/api/arcade/leaderboard/${activeTab}`,
          {
            params: { timeFilter },
          }
        );

        setLeaderboard(response.data.leaderboard || []);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      toast.error("Không thể tải bảng xếp hạng!");
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch khi tab hoặc filter thay đổi
  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab, timeFilter, limit]);

  /**
   * Render medal cho top 3
   */
  const renderMedal = (rank) => {
    if (rank === 1) return <span className="gold-medal">1</span>;
    if (rank === 2) return <span className="silver-medal">2</span>;
    if (rank === 3) return <span className="bronze-medal">3</span>;
    return <span className="rank-number">{rank}</span>;
  };

  /**
   * Format accuracy
   */
  const formatAccuracy = (accuracy) => {
    return accuracy ? `${accuracy.toFixed(1)}%` : "N/A";
  };

  /**
   * Render table cho lessons
   */
  const renderLessonsTable = () => (
    <div className="leaderboard-table-container">
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th className="rank-col">Hạng</th>
            <th className="username-col">Người dùng</th>
            <th className="score-col">Tổng điểm</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.length === 0 ? (
            <tr>
              <td colSpan={3} className="empty-message">
                Chưa có dữ liệu bảng xếp hạng
              </td>
            </tr>
          ) : (
            leaderboard.map((entry, index) => (
              <tr
                key={entry.username + index}
                className={`leaderboard-row ${index < 3 ? "top-three" : ""}`}
              >
                <td className="rank-col">
                  <span className="rank-badge">{renderMedal(entry.rank)}</span>
                </td>
                <td className="username-col">
                  <span className="username">{entry.username}</span>
                </td>
                <td className="score-col">
                  <span className="score">{entry.totalScore}</span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Current user info (if not in top) */}
      {currentUserData && !currentUserData.inTop && (
        <div className="current-user-info">
          <div className="current-user-label">Vị trí của bạn</div>
          <div className="current-user-stats">
            <span className="username">{currentUserData.username}</span>
            <span className="rank">Hạng: {currentUserData.rank}</span>
            <span className="score">Điểm: {currentUserData.totalScore}</span>
          </div>
        </div>
      )}
    </div>
  );

  /**
   * Render table cho arcade games (defense/fruit)
   */
  const renderArcadeTable = () => (
    <div className="leaderboard-table-container">
      <table className="leaderboard-table arcade-table">
        <thead>
          <tr>
            <th className="rank-col">Hạng</th>
            <th className="username-col">Người chơi</th>
            <th className="score-col">Điểm cao nhất</th>
            <th className="accuracy-col">Độ chính xác</th>
            <th className="plays-col">Số lần chơi</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.length === 0 ? (
            <tr>
              <td colSpan={5} className="empty-message">
                Chưa có dữ liệu. Hãy chơi game để xuất hiện trên bảng xếp hạng!
              </td>
            </tr>
          ) : (
            leaderboard.map((entry, index) => (
              <tr
                key={entry.userId}
                className={`leaderboard-row ${index < 3 ? "top-three" : ""}`}
              >
                <td className="rank-col">
                  <span className="rank-badge">{renderMedal(entry.rank)}</span>
                </td>
                <td className="username-col">
                  <span className="username">{entry.username}</span>
                </td>
                <td className="score-col">
                  <span className="score">{entry.bestScore}</span>
                </td>
                <td className="accuracy-col">
                  <span className="accuracy">
                    {formatAccuracy(entry.avgAccuracy)}
                  </span>
                </td>
                <td className="plays-col">
                  <span className="plays">{entry.totalPlays}</span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="unified-leaderboard-page">
      {/* Header */}
      <div className="leaderboard-header">
        <button
          className="back-button"
          onClick={() => navigate("/games")}
          title="Quay lại"
        >
          ← Quay lại
        </button>
        <h1>Bảng Xếp Hạng</h1>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        <button
          className={`tab-button ${activeTab === "lessons" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("lessons");
            setTimeFilter("all"); // Reset filter khi đổi tab
          }}
        >
          Bài Học
        </button>
        <button
          className={`tab-button ${activeTab === "defense" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("defense");
            setTimeFilter("all");
          }}
        >
          Typing Defense
        </button>
        <button
          className={`tab-button ${activeTab === "fruit" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("fruit");
            setTimeFilter("all");
          }}
        >
          Typing Fruit
        </button>
      </div>

      {/* Filters Row */}
      <div className="filters-row">
        {/* Time Filter */}
        <div className="time-filter">
          <button
            className={`filter-button ${timeFilter === "all" ? "active" : ""}`}
            onClick={() => setTimeFilter("all")}
          >
            Mọi lúc
          </button>
          <button
            className={`filter-button ${
              timeFilter === "month" ? "active" : ""
            }`}
            onClick={() => setTimeFilter("month")}
          >
            {activeTab === "lessons" ? "30 ngày" : "Tháng này"}
          </button>
          <button
            className={`filter-button ${timeFilter === "day" ? "active" : ""}`}
            onClick={() => setTimeFilter("day")}
          >
            {activeTab === "lessons" ? "24 giờ" : "Hôm nay"}
          </button>
        </div>

        {/* Limit selector (chỉ cho lessons tab) */}
        {activeTab === "lessons" && (
          <div className="limit-selector">
            <label htmlFor="limit">Số lượng:</label>
            <select
              id="limit"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Leaderboard Content */}
      <div className="leaderboard-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Đang tải bảng xếp hạng...</p>
          </div>
        ) : activeTab === "lessons" ? (
          renderLessonsTable()
        ) : (
          renderArcadeTable()
        )}
      </div>

      {/* Footer Info */}
      {activeTab !== "lessons" && (
        <div className="leaderboard-footer">
          <p>
            <strong>Lưu ý:</strong> Chỉ điểm cao nhất của mỗi người chơi được
            tính xếp hạng
          </p>
        </div>
      )}
    </div>
  );
}

export default UnifiedLeaderboardPage;
