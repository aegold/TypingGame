/**
 * Cấu hình game TypingFruitGame
 * Chứa tất cả các hằng số và thiết lập cho game
 */

/**
 * Cấu hình game mặc định
 */
export const DEFAULT_CONFIG = {
  width: 1000,
  height: 450, // Giảm chiều cao từ 500 xuống 400

  // Trọng lực (px/s²) - Tăng = quả rơi nhanh hơn, Giảm = quả bay lâu hơn/cao hơn
  gravity: 250,

  // Tốc độ spawn quả (milliseconds) - Tăng = spawn chậm hơn, Giảm = spawn nhanh hơn
  spawnRateMs: 1200,

  // Số quả tối đa trên màn hình - Tăng = nhiều quả hơn, Giảm = ít quả hơn
  maxActive: 3,

  letterPool: "abcdefghijklmnopqrstuvwxyz",
  startLives: 999, // vô hạn mạng

  // Kích thước quả - Tăng = quả to hơn/dễ thấy, Giảm = quả nhỏ hơn/khó thấy
  fruitRadius: { min: 30, max: 40 },

  velocityRange: {
    // Vận tốc ngang (px/s) - Đặt = 0 để quả chỉ bay thẳng đứng, không sang 2 bên
    vx: { min: 0, max: 0 },

    // Vận tốc dọc ban đầu (px/s, âm = bay lên) - Tăng để bay cao tới 3/4 khung game
    vy: { min: -420, max: -380 },
  },

  // Thời gian hiệu ứng nổ (milliseconds) - Tăng = nổ lâu hơn, Giảm = nổ nhanh hơn
  popDuration: 200,

  // Cấu hình slash effect khi cắt quả
  slashEffect: {
    duration: 300, // thời gian hiệu ứng (ms)
    lineWidth: 4, // độ dày đường chém
    lineLength: 80, // độ dài đường chém
    color: "#FFFFFF", // màu đường chém (trắng)
    opacity: { start: 1, end: 0 }, // opacity từ 1 → 0
  },
};

/**
 * Màu sắc ngẫu nhiên cho quả
 */
export const FRUIT_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FECA57",
  "#FF9FF3",
  "#54A0FF",
  "#5F27CD",
  "#00D2D3",
  "#FF9F43",
];

/**
 * Trạng thái game
 */
export const GAME_STATES = {
  READY: "ready",
  PLAYING: "playing",
  PAUSED: "paused",
  GAME_OVER: "gameOver",
};

/**
 * Trạng thái quả
 */
export const FRUIT_STATES = {
  ALIVE: "alive",
  POPPING: "popping",
};
