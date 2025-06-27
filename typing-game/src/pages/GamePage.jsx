import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import TypingGame from "../components/TypingGame";
import ParagraphTypingGame from "../components/ParagraphTypingGame";

function GamePage() {
  const [result, setResult] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  // Lấy thông tin lesson từ API
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/lessons/${id}`);
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
  const handleDashboard = () => navigate("/dashboard");

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
        return <div>Game gõ chữ chưa được hỗ trợ</div>;
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

          {/* Chỉ hiển thị lịch sử từ cho game từ, không hiển thị cho paragraph */}
          {lesson &&
            lesson.gameType !== "paragraphTyper" &&
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
              Về trang Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GamePage;
