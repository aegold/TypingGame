import { DEFAULT_CONFIG, FRUIT_COLORS, FRUIT_STATES } from "./config";

/**
 * Utilities cho TypingFruitGame
 * Chứa các hàm tiện ích và helper functions
 */

/**
 * Tạo quả mới với thuộc tính ngẫu nhiên
 * @param {Object} config - Cấu hình game
 * @param {string} letterPool - Chuỗi các chữ cái có thể sử dụng
 * @returns {Object} Quả mới
 */
export const createFruit = (config, letterPool) => {
  const { width, height } = config;

  // Vị trí spawn ngẫu nhiên ở dưới màn hình (nhưng vẫn có thể thấy được)
  const spawnX = Math.random() * width;
  const spawnY = height - 20; // Spawn gần đáy màn hình nhưng vẫn thấy được

  // Tính toán vận tốc để luôn bay về phía giữa khung game
  const centerX = width / 2;
  const distanceToCenter = centerX - spawnX;

  // Vận tốc ngang: hướng về giữa với tốc độ tỉ lệ với khoảng cách
  const vx = (distanceToCenter / width) * 200; // 200 là hệ số điều chỉnh tốc độ

  // Vận tốc dọc ngẫu nhiên - vy âm để bay lên
  const vy =
    DEFAULT_CONFIG.velocityRange.vy.min +
    Math.random() *
      (DEFAULT_CONFIG.velocityRange.vy.max -
        DEFAULT_CONFIG.velocityRange.vy.min);

  // Chữ cái ngẫu nhiên
  const label = letterPool[Math.floor(Math.random() * letterPool.length)];

  // Bán kính và màu ngẫu nhiên
  const radius =
    DEFAULT_CONFIG.fruitRadius.min +
    Math.random() *
      (DEFAULT_CONFIG.fruitRadius.max - DEFAULT_CONFIG.fruitRadius.min);
  const color = FRUIT_COLORS[Math.floor(Math.random() * FRUIT_COLORS.length)];

  return {
    id: Date.now() + Math.random(),
    label: label.toLowerCase(),
    x: spawnX,
    y: spawnY,
    vx: vx,
    vy: vy,
    radius: radius,
    color: color,
    bornAt: Date.now(),
    state: FRUIT_STATES.ALIVE,
    popStartTime: null,
  };
};

/**
 * Cập nhật vật lý cho một quả
 * @param {Object} fruit - Quả cần cập nhật
 * @param {number} deltaTime - Thời gian giữa các frame (seconds)
 * @param {number} gravity - Gia tốc trọng trường
 * @returns {Object} Quả đã cập nhật
 */
export const updateFruitPhysics = (fruit, deltaTime, gravity) => {
  if (fruit.state !== FRUIT_STATES.ALIVE) {
    return fruit;
  }

  // Cập nhật vận tốc theo gravity (vy tăng dần, từ âm về dương)
  const newVy = fruit.vy + gravity * deltaTime;
  // Cập nhật vị trí theo vận tốc hiện tại
  const newX = fruit.x + fruit.vx * deltaTime;
  const newY = fruit.y + fruit.vy * deltaTime;

  return {
    ...fruit,
    x: newX,
    y: newY,
    vy: newVy,
  };
};

/**
 * Kiểm tra xem quả có nằm ngoài màn hình không
 * @param {Object} fruit - Quả cần kiểm tra
 * @param {Object} config - Cấu hình game (width, height)
 * @returns {boolean} True nếu quả nằm ngoài màn hình
 */
export const isFruitOutOfBounds = (fruit, config) => {
  // Chỉ xóa quả khi nó rơi xuống (vy > 0) và ra khỏi màn hình
  return fruit.y > config.height + 100 && fruit.vy > 0;
};

/**
 * Kiểm tra xem animation pop đã hoàn thành chưa
 * @param {Object} fruit - Quả cần kiểm tra
 * @returns {boolean} True nếu animation đã hoàn thành
 */
export const isPopAnimationComplete = (fruit) => {
  if (fruit.state !== FRUIT_STATES.POPPING || !fruit.popStartTime) {
    return false;
  }

  const elapsed = Date.now() - fruit.popStartTime;
  return elapsed > DEFAULT_CONFIG.popDuration;
};

/**
 * Tìm quả phù hợp để "cắt" dựa trên chữ cái
 * @param {Array} fruits - Danh sách quả
 * @param {string} key - Chữ cái người dùng nhập
 * @returns {Object|null} Quả được chọn hoặc null
 */
export const findTargetFruit = (fruits, key) => {
  const matchingFruits = fruits.filter(
    (f) => f.state === FRUIT_STATES.ALIVE && f.label === key.toLowerCase()
  );

  if (matchingFruits.length === 0) {
    return null;
  }

  // Chọn quả có y lớn nhất (gần đáy nhất)
  return matchingFruits.reduce((max, current) =>
    current.y > max.y ? current : max
  );
};

/**
 * Tính toán hiệu ứng pop animation
 * @param {Object} fruit - Quả đang pop
 * @returns {Object} Thông tin hiệu ứng { opacity, scale }
 */
export const calculatePopEffect = (fruit) => {
  if (fruit.state !== FRUIT_STATES.POPPING || !fruit.popStartTime) {
    return { opacity: 1, scale: 1 };
  }

  const elapsed = Date.now() - fruit.popStartTime;
  const progress = Math.min(elapsed / DEFAULT_CONFIG.popDuration, 1);

  return {
    opacity: 1 - progress,
    scale: 1 + progress * 0.5,
  };
};

/**
 * Validate delta time để tránh jump
 * @param {number} deltaTime - Thời gian giữa các frame
 * @returns {boolean} True nếu delta time hợp lệ
 */
export const isValidDeltaTime = (deltaTime) => {
  return deltaTime > 0 && deltaTime <= 0.1; // Tối đa 100ms
};

/**
 * Kiểm tra input key có hợp lệ không (a-z)
 * @param {string} key - Phím người dùng nhấn
 * @returns {boolean} True nếu key hợp lệ
 */
export const isValidInputKey = (key) => {
  return /^[a-z]$/.test(key.toLowerCase());
};

/**
 * Tạo slash effect khi cắt quả
 * @param {Object} fruit - Quả bị cắt
 * @returns {Object} Slash effect object
 */
export const createSlashEffect = (fruit) => {
  // Góc random từ 0 đến 360 độ
  const angle = Math.random() * Math.PI * 2;

  // Độ dài đường chém
  const length = DEFAULT_CONFIG.slashEffect.lineLength;

  // Tính toán điểm đầu và cuối của đường chém (đi qua tâm quả)
  const halfLength = length / 2;
  const startX = fruit.x - Math.cos(angle) * halfLength;
  const startY = fruit.y - Math.sin(angle) * halfLength;
  const endX = fruit.x + Math.cos(angle) * halfLength;
  const endY = fruit.y + Math.sin(angle) * halfLength;

  return {
    id: Date.now() + Math.random(),
    startX,
    startY,
    endX,
    endY,
    angle,
    createdAt: Date.now(),
    duration: DEFAULT_CONFIG.slashEffect.duration,
  };
};

/**
 * Tính toán opacity cho slash effect theo thời gian
 * @param {Object} slashEffect - Slash effect object
 * @returns {number} Opacity từ 1 → 0
 */
export const calculateSlashOpacity = (slashEffect) => {
  const elapsed = Date.now() - slashEffect.createdAt;
  const progress = Math.min(elapsed / slashEffect.duration, 1);

  // Opacity từ 1 xuống 0
  return 1 - progress;
};

/**
 * Kiểm tra slash effect đã hết thời gian chưa
 * @param {Object} slashEffect - Slash effect object
 * @returns {boolean} True nếu đã hết thời gian
 */
export const isSlashEffectComplete = (slashEffect) => {
  const elapsed = Date.now() - slashEffect.createdAt;
  return elapsed >= slashEffect.duration;
};
