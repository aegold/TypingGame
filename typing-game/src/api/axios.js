import axios from "axios";

// Xác định API URL dựa trên môi trường
const getApiUrl = () => {
  // Ưu tiên biến môi trường REACT_APP_API_URL
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // Fallback dựa trên NODE_ENV
  if (process.env.NODE_ENV === "production") {
    // URL mặc định cho production - bạn sẽ thay đổi này
    return "https://your-domain.com/api";
  }

  // Default cho development
  return "http://localhost:5000";
};

const API_URL = getApiUrl();

// Log để debug (chỉ trong development)
if (process.env.NODE_ENV === "development") {
  console.log("🌐 API URL:", API_URL);
  console.log(
    "📝 Environment:",
    process.env.REACT_APP_ENV || process.env.NODE_ENV
  );
}

const instance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Thêm timeout để tránh request bị treo
  timeout: 10000,
});

// Thêm interceptor để tự động gửi token nếu có
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
