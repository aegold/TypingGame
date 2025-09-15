import React from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

/**
 * Navbar Component
 * Thanh navigation bar với đăng nhập/đăng ký/đăng xuất
 * Kiểm tra trạng thái đăng nhập và hiển thị các nút phù hợp
 * Sử dụng Tailwind CSS cho styling
 */
function Navbar() {
  const { isLoggedIn, username, isLoading, logout } = useAuth();
  const location = useLocation();

  /**
   * Xử lý đăng xuất
   */
  const handleLogout = () => {
    logout(); // AuthContext sẽ handle navigation
    toast.success("Đăng xuất thành công!");
  };

  /**
   * Kiểm tra trang hiện tại có phải GamePage không
   */
  const isGamePage =
    location.pathname.startsWith("/game/") ||
    location.pathname === "/game" ||
    location.pathname === "/typing-defense" ||
    location.pathname === "/typing-fruit";

  // Không hiển thị navbar ở GamePage cụ thể, nhưng hiển thị ở GameList (/games)
  if (isGamePage) {
    return null;
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50 navbar-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo và tên ứng dụng */}
          <div className="flex items-center">
            <Link
              to="/lessons"
              className="flex items-center space-x-2 text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors duration-200"
            >
              <span className="hidden sm:block">Typing Game</span>
              <span className="block sm:hidden">TG</span>
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-6 navbar-desktop-menu">
            <Link
              to="/lessons"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                location.pathname.startsWith("/lessons")
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              Bài học
            </Link>
            <Link
              to="/games"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                location.pathname === "/games"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              Game
            </Link>
            <Link
              to="/dashboard"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                location.pathname === "/dashboard"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/leaderboard"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                location.pathname === "/leaderboard"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              Leaderboard
            </Link>
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-600 hidden sm:block">
                  Đang tải...
                </span>
              </div>
            ) : isLoggedIn ? (
              // Hiển thị khi đã đăng nhập
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-700 text-sm font-medium hidden sm:block">
                    {username}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  <span className="hidden sm:block">Đăng xuất</span>
                  <span className="block sm:hidden">Thoát</span>
                </button>
              </div>
            ) : (
              // Hiển thị khi chưa đăng nhập
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 px-2 py-2 sm:px-3 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu - Navigation Links */}
      <div className="md:hidden navbar-mobile-menu border-t border-gray-200">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            to="/lessons"
            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
              location.pathname.startsWith("/lessons")
                ? "text-blue-600 bg-blue-50"
                : "text-gray-700 hover:text-blue-600"
            }`}
          >
            Bài học
          </Link>
          <Link
            to="/games"
            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
              location.pathname === "/games"
                ? "text-blue-600 bg-blue-50"
                : "text-gray-700 hover:text-blue-600"
            }`}
          >
            🎮 Game
          </Link>
          <Link
            to="/dashboard"
            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
              location.pathname === "/dashboard"
                ? "text-blue-600 bg-blue-50"
                : "text-gray-700 hover:text-blue-600"
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/leaderboard"
            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
              location.pathname === "/leaderboard"
                ? "text-blue-600 bg-blue-50"
                : "text-gray-700 hover:text-blue-600"
            }`}
          >
            Leaderboard
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
