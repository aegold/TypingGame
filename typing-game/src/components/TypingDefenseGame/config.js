/**
 * Cấu hình game TypingDefenseGame
 * Chứa tất cả các hằng số và thiết lập cho game
 */

/**
 * Danh sách từ tiếng Anh đơn giản phù hợp với trẻ em
 * Bao gồm: động vật, đồ vật, màu sắc, tính từ cơ bản
 */
export const WORD_LIST = [
  "cat",
  "dog",
  "fish",
  "bird",
  "apple",
  "tree",
  "sun",
  "moon",
  "car",
  "bus",
  "book",
  "pen",
  "red",
  "blue",
  "big",
  "small",
  "home",
  "food",
  "toy",
  "ball",
  "run",
  "jump",
  "play",
  "sing",
  "love",
  "happy",
  "nice",
  "good",
  "cool",
  "fun",
  "sweet",
  "kind",
  "water",
  "milk",
  "cake",
  "ice",
  "hot",
  "cold",
  "up",
  "down",
];

/**
 * Cấu hình game mặc định - các thông số có thể điều chỉnh
 * width: chiều rộng màn hình game (800px)
 * height: chiều cao màn hình game (600px)
 * enemySpeed: tốc độ rơi của quái vật (50 pixel/giây)
 * enemySpawnRate: thời gian giữa các lần xuất hiện quái vật (2 giây)
 * enemySize: kích thước quái vật (60px)
 * fontSize: cỡ chữ hiển thị trên quái vật (16px)
 * colors: bảng màu của game
 */
export const GAME_CONFIG = {
  width: 800,
  height: 600,
  enemySpeed: 50, // tốc độ rơi: pixel/giây
  enemySpawnRate: 2000, // tần suất xuất hiện: mili giây
  enemySize: 60,
  fontSize: 16,
  bulletSpeed: 500, // Tốc độ đạn: pixel/giây
  turretSize: { base: 50, barrel: 20 }, // Kích thước trụ súng
  bulletSize: { width: 6, height: 16 }, // Kích thước đạn
  fadeOutDuration: 800, // Thời gian fade out khi tiêu diệt (ms) - giảm xuống để rõ hơn trong production
  colors: {
    background: "#B8E6FF", // màu nền trời xanh sáng hơn
    enemy: "#FF6B6B", // màu quái vật đỏ
    enemySelected: "#FF4444", // màu kẻ địch được chọn
    enemyText: "#FFFFFF", // màu chữ trắng để dễ đọc trên nền
    enemyTextTyped: "#00FF00", // màu phần đã gõ (xanh lá)
    enemyTextRemaining: "#CCCCCC", // màu phần chưa gõ (xám nhạt)
    score: "#2E8B57", // màu điểm số xanh lá
    input: "#4A90E2", // màu input xanh dương
    turret: "#666666", // màu thân trụ súng
    turretBase: "#4A4A4A", // màu đế trụ súng
    turretBarrel: "#333333", // màu nòng súng
    bullet: "#FFD700", // màu đạn vàng
    bulletStroke: "#FFA500", // màu viền đạn
    bulletTip: "#FF6B00", // màu đầu đạn
    bulletTrail: "#FFEA00", // màu trail đạn
    ground: "#8B4513", // màu đất
  },
};

/**
 * Trạng thái game
 */
export const GAME_STATES = {
  READY: "ready",
  PLAYING: "playing",
  GAME_OVER: "gameOver",
};

/**
 * Trạng thái kẻ địch
 */
export const ENEMY_STATES = {
  ALIVE: "alive",
  MATCHED: "matched",
  TARGETED: "targeted",
};

/**
 * Trạng thái hiển thị
 */
export const DISPLAY_STATES = {
  TYPING: "typing",
  SUCCESS: "success",
  FAIL: "fail",
  NONE: "",
};
