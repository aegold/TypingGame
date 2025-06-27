import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProfile(res.data))
      .catch(() => alert("Token không hợp lệ hoặc đã hết hạn"));
  }, []);

  if (!profile) return <div>Đang tải dữ liệu...</div>;

  return (
    <div>
      <h2>Xin chào {profile.username}</h2>
      <p>Tổng điểm: {profile.totalScore}</p>
      <button
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
        onClick={() => navigate("/lessons")}
      >
        Chơi game
      </button>
      <ul>
        {profile.history.map((entry, index) => (
          <li key={index}>
            {entry.gameId} - {entry.score} điểm -{" "}
            {new Date(entry.date).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DashboardPage;
