import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import TypingGame from "../components/TypingGame";
import ParagraphTypingGame from "../components/ParagraphTypingGame";
import LetterTypingGame from "../components/LetterTypingGame";

function GamePage() {
  const [result, setResult] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  // Hàm quay về trang lessons
  const handleBackToLessons = () => {
    navigate("/lessons");
  };

  // Lấy thông tin lesson từ API
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/lessons/${id}`);
        setLesson(response.data);
        setError(null);
      } catch (err) {
        setError("Không thể tải thông tin bài học");
        console.error("Error fetching lesson:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLesson();
    }
  }, [id]);

  const handleGameFinish = (data) => {
    setResult(data);
    const token = localStorage.getItem("token");
    axios
      .post(
        "/score",
        {
          lessonId: id,
          score: data.score,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(() => alert("Điểm đã được lưu"))
      .catch(() => alert("Lỗi khi lưu điểm"));
  };

  const handleRestart = () => setResult(null);
  const handleDashboard = () => navigate("/lessons");

  // Render component game dựa vào gameType
  const renderGameComponent = () => {
    if (!lesson) return null;
    if (!Array.isArray(lesson.words) || lesson.words.length === 0) {
      return (
        <div style={{ color: "red", textAlign: "center", marginTop: 32 }}>
          Bài học này chưa có dữ liệu từ để luyện tập.
        </div>
      );
    }
    switch (lesson.gameType) {
      case "letterTyper":
        return (
          <LetterTypingGame
            onFinish={handleGameFinish}
            sequences={lesson.words} // words array sẽ chứa array of sequences
            autoNextLevel={true}
          />
        );
      case "wordTyper":
        return (
          <TypingGame
            onFinish={handleGameFinish}
            noTopMargin={true}
            timer={lesson.timer}
            words={lesson.words}
          />
        );
      case "paragraphTyper":
        return (
          <ParagraphTypingGame
            onFinish={handleGameFinish}
            noTopMargin={true}
            timer={lesson.timer}
            words={lesson.words}
          />
        );
      default:
        return <div>Game type không được hỗ trợ</div>;
    }
  };

  if (loading) {
    return (
      <div className="gamepage-center">
        <div>Đang tải bài học...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gamepage-center">
        <div>Lỗi: {error}</div>
        <button onClick={() => navigate("/dashboard")}>Về Dashboard</button>
      </div>
    );
  }

  return (
    <div className="gamepage-center">
      {/* Nút quay về*/}
      <button
        onClick={handleBackToLessons}
        style={{
          position: "fixed",
          top: "25px",
          left: "100px",
          zIndex: 1000,
          padding: "8px 12px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        ← Quay lại
      </button>

      {!result ? (
        renderGameComponent()
      ) : (
        <div className="game-over-new score-only">
          <h2>Kết thúc!</h2>
          <div className="score-big">
            Số điểm của bạn: <b>{result.score}</b>
          </div>

          {/* Hiển thị thống kê khác nhau tùy theo gameType */}
          {lesson && lesson.gameType === "paragraphTyper" ? (
            <div className="result-summary">
              <div className="history-correct">
                Ký tự đúng: <b>{result.correctChars || 0}</b>
              </div>
              <div className="history-wrong">
                Ký tự sai: <b>{result.incorrectChars || 0}</b>
              </div>
              <div className="history-accuracy">
                Độ chính xác: <b>{Math.round(result.accuracy || 0)}%</b>
              </div>
            </div>
          ) : lesson && lesson.gameType === "letterTyper" ? (
            <div className="result-summary">
              <div className="history-correct">
                Tổng ký tự: <b>{result.totalCharacters || 0}</b>
              </div>
              <div className="history-wrong">
                Số lỗi: <b>{result.errors || 0}</b>
              </div>
              <div className="history-accuracy">
                Độ chính xác: <b>{result.accuracy || 0}%</b>
              </div>
              <div className="history-wpm">
                Tốc độ: <b>{result.wpm || 0} WPM</b>
              </div>
              <div className="history-time">
                Thời gian: <b>{result.timeSpent || 0}s</b>
              </div>
              {result.allSequencesCompleted && (
                <div className="history-levels">
                  Hoàn thành: <b>{result.totalSequences || 0} levels</b>
                </div>
              )}
            </div>
          ) : (
            <div className="result-summary">
              <div className="history-correct">
                Số từ đúng: <b>{result.correctResults?.length || 0}</b>
              </div>
              <div className="history-wrong">
                Số từ sai: <b>{result.wrongResults?.length || 0}</b>
              </div>
            </div>
          )}

          {/* Chỉ hiển thị lịch sử từ cho wordTyper, không hiển thị cho paragraph và letterTyper */}
          {lesson &&
            lesson.gameType === "wordTyper" &&
            result.correctResults &&
            result.wrongResults && (
              <div className="result-history">
                <div>
                  <div className="word-history-title">Từ đúng</div>
                  <ul className="result-list">
                    {result.correctResults.map((w, i) => (
                      <li key={i} className="correct">
                        {w}
                      </li>
                    ))}
                    {result.correctResults.length === 0 && (
                      <li>Không có từ đúng</li>
                    )}
                  </ul>
                </div>
                <div>
                  <div className="word-history-title">Từ sai</div>
                  <ul className="result-list">
                    {result.wrongResults.map((w, i) => (
                      <li key={i} className="incorrect">
                        {w}
                      </li>
                    ))}
                    {result.wrongResults.length === 0 && (
                      <li>Không có từ sai</li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          <div className="result-buttons">
            <button
              onClick={handleRestart}
              className="restart-button"
              style={{ marginTop: 16 }}
            >
              Chơi lại
            </button>
            <button
              onClick={handleDashboard}
              className="dashboard-button"
              style={{ marginTop: 16, marginLeft: 16 }}
            >
              <span role="img" aria-label="dashboard">
                🏠
              </span>{" "}
              Về trang Lesson
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GamePage;
