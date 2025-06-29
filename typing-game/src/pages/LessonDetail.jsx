import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../styles/TypingGame.css";

function LessonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return (
      <div className="lesson-detail-bg">
        <div>Đang tải thông tin bài học...</div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="lesson-detail-bg">
        <div>Lỗi: {error || "Không tìm thấy bài học"}</div>
        <button onClick={() => navigate("/lessons")}>
          Về danh sách bài học
        </button>
      </div>
    );
  }

  return (
    <div className="lesson-detail-bg">
      <div className="lesson-detail-card">
        <div className="lesson-title">{lesson.title}</div>

        <div className="lesson-info">
          <div className="info-item">
            <strong>Loại game:</strong> {lesson.gameType}
          </div>
          <div className="info-item">
            <strong>Thời gian:</strong> {lesson.timer} giây
          </div>
          <div className="info-item">
            <strong>Số từ:</strong> {lesson.words.length} từ
          </div>
        </div>

        {lesson.videoUrl && (
          <>
            <div className="lesson-video-wrap">
              <iframe
                width="480"
                height="270"
                src={lesson.videoUrl}
                title="Video hướng dẫn"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ borderRadius: 16, margin: "24px 0" }}
              ></iframe>
            </div>
            <button
              className="lesson-detail-btn"
              onClick={() => alert("Đã xem xong video!")}
            >
              Đã xem xong
            </button>
          </>
        )}

        <button
          className="lesson-detail-btn"
          onClick={() => navigate(`/game/${lesson._id}`)}
          style={{ marginTop: 32 }}
        >
          Bắt đầu luyện tập
        </button>
      </div>
    </div>
  );
}

export default LessonDetail;
