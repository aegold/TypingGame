import React, { useEffect, useState } from "react";
import axios from "../api/axios";

function LeaderboardPage() {
  const [data, setData] = useState({ leaderboard: [], me: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [limit, setLimit] = useState(10);
  const [period, setPeriod] = useState("all"); // all | month | day

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");

    axios
      .get(`/api/leaderboard`, { params: { limit, period } })
      .then((res) => {
        if (!isMounted) return;
        setData({
          leaderboard: res.data.leaderboard || [],
          me: res.data.me || null,
        });
      })
      .catch((err) => {
        if (!isMounted) return;
        setError("Không thể tải bảng xếp hạng. Vui lòng thử lại.");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [limit, period]);

  const renderRow = (item, index) => {
    const rank = item.rank;
    let rankColor = "text-gray-800";
    if (rank === 1) rankColor = "text-yellow-600";
    else if (rank === 2) rankColor = "text-gray-500";
    else if (rank === 3) rankColor = "text-orange-600";

    return (
      <tr
        key={index}
        className="border-b last:border-b-0 hover:bg-gray-50 transition-colors"
      >
        <td className={`px-4 py-2 font-semibold ${rankColor}`}>{rank}</td>
        <td className="px-4 py-2">{item.username}</td>
        <td className="px-4 py-2 text-right">{item.totalScore}</td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Bảng xếp hạng</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center space-x-2">
              <label htmlFor="period" className="text-sm text-gray-600">
                Thời gian
              </label>
              <select
                id="period"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All time</option>
                <option value="month">30 ngày</option>
                <option value="day">24 giờ</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="limit" className="text-sm text-gray-600">
                Số lượng
              </label>
              <select
                id="limit"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
            Đang tải bảng xếp hạng...
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-red-600">
            {error}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop table */}
            <div className="hidden sm:block bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr className="text-left text-sm text-gray-600">
                    <th className="px-4 py-2 w-20">Hạng</th>
                    <th className="px-4 py-2">Người dùng</th>
                    <th className="px-4 py-2 text-right">Tổng điểm</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-800">
                  {data.leaderboard.map((item, idx) => renderRow(item, idx))}
                  {data.leaderboard.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-6 text-center text-gray-500"
                      >
                        Chưa có dữ liệu bảng xếp hạng.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="sm:hidden space-y-2">
              {data.leaderboard.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500">
                  Chưa có dữ liệu bảng xếp hạng.
                </div>
              ) : (
                data.leaderboard.map((item) => {
                  const rank = item.rank;
                  let rankColor = "text-gray-800";
                  if (rank === 1) rankColor = "text-yellow-600";
                  else if (rank === 2) rankColor = "text-gray-500";
                  else if (rank === 3) rankColor = "text-orange-600";

                  return (
                    <div
                      key={item.username + rank}
                      className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`text-lg font-semibold ${rankColor}`}>
                          {rank}
                        </div>
                        <div className="text-gray-800 font-medium">
                          {item.username}
                        </div>
                      </div>
                      <div className="text-gray-700 font-semibold">
                        {item.totalScore}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Current user rank (if available and not in top) */}
            {data.me && !data.me.inTop && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-blue-700">Vị trí của bạn</div>
                <div className="mt-1 flex items-center justify-between">
                  <div className="text-gray-800 font-medium">
                    {data.me.username}
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-gray-700">
                      Hạng:{" "}
                      <span className="font-semibold">{data.me.rank}</span>
                    </div>
                    <div className="text-gray-700">
                      Tổng điểm:{" "}
                      <span className="font-semibold">
                        {data.me.totalScore}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default LeaderboardPage;
