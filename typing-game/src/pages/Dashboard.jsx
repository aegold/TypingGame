import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isLoggedIn, isLoading: authLoading, logout } = useAuth();

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate("/login");
      return;
    }

    if (isLoggedIn) {
      const token = localStorage.getItem("token");
      axios
        .get("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setProfile(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Profile fetch error:", err);
          setError("Không thể tải thông tin tài khoản");
          setLoading(false);
          // Nếu token không hợp lệ, sử dụng AuthContext logout
          if (err.response?.status === 401) {
            logout("/login");
          }
        });
    }
  }, [navigate, isLoggedIn, authLoading, logout]);

  if (authLoading || loading) {
    return (
      <div className="page-content">
        <div className="flex items-center justify-center min-h-96">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg text-gray-600">Đang tải dữ liệu...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-4">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Xin chào, {profile.username}! 👋
              </h1>
              <p className="text-gray-600">
                Chào mừng bạn quay trở lại với Typing Game
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {profile.totalScore}
              </div>
              <div className="text-sm text-gray-500">Tổng điểm</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Bắt đầu chơi
            </h2>
            <p className="text-gray-600 mb-4">
              Luyện tập kỹ năng đánh máy với các bài học đa dạng
            </p>
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-5 py-3 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() => navigate("/lessons")}
            >
              Chọn bài học
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Thống kê
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Số lần chơi:</span>
                <span className="font-medium">
                  {profile.history?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Điểm cao nhất:</span>
                <span className="font-medium">
                  {profile.history?.length > 0
                    ? Math.max(...profile.history.map((h) => h.score))
                    : 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Lịch sử gần đây
          </h2>
          {profile.history && profile.history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-3">Bài học</th>
                    <th className="px-4 py-3">Điểm</th>
                    <th className="px-4 py-3">Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.history
                    .slice(-10) // Hiển thị 10 kết quả gần nhất
                    .reverse()
                    .map((entry, index) => (
                      <tr
                        key={index}
                        className="bg-white border-b hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {entry.gameId}
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            {entry.score} điểm
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {new Date(entry.date).toLocaleString("vi-VN")}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">
                Chưa có lịch sử chơi. Hãy bắt đầu với bài học đầu tiên!
              </p>
              <button
                onClick={() => navigate("/lessons")}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
              >
                Bắt đầu ngay
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
