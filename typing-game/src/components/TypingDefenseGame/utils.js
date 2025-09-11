/**
 * Utility functions cho TypingDefenseGame
 * Chứa các hàm xử lý logic game, tính toán vật lý, và helper functions
 */

import { GAME_CONFIG, WORD_LIST, ENEMY_STATES } from "./config";

/**
 * Lấy một từ ngẫu nhiên từ danh sách WORD_LIST
 * @returns {string} Từ ngẫu nhiên
 */
export const getRandomWord = () => {
  return WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
};

/**
 * Tạo một kẻ địch mới với thuộc tính ngẫu nhiên
 * @returns {object} Enemy object với các thuộc tính cần thiết
 */
export const createEnemy = () => {
  const x = Math.random() * (GAME_CONFIG.width - GAME_CONFIG.enemySize);
  return {
    id: Date.now() + Math.random(),
    x: x,
    y: -GAME_CONFIG.enemySize,
    word: getRandomWord(),
    matched: false,
    state: ENEMY_STATES.ALIVE,
  };
};

/**
 * Cập nhật vật lý cho kẻ địch (di chuyển)
 * @param {object} enemy - Kẻ địch cần cập nhật
 * @param {number} deltaTime - Thời gian delta (giây)
 * @returns {object} Enemy object đã được cập nhật
 */
export const updateEnemyPhysics = (enemy, deltaTime) => {
  return {
    ...enemy,
    y: enemy.y + GAME_CONFIG.enemySpeed * deltaTime,
  };
};

/**
 * Kiểm tra kẻ địch có ra khỏi màn hình không
 * @param {object} enemy - Kẻ địch cần kiểm tra
 * @returns {boolean} True nếu ra khỏi màn hình
 */
export const isEnemyOutOfBounds = (enemy) => {
  return enemy.y >= GAME_CONFIG.height - GAME_CONFIG.enemySize;
};

/**
 * Kiểm tra kẻ địch có nằm trong màn hình không (để filter)
 * @param {object} enemy - Kẻ địch cần kiểm tra
 * @returns {boolean} True nếu còn trong màn hình
 */
export const isEnemyInBounds = (enemy) => {
  return enemy.y < GAME_CONFIG.height + 50;
};

/**
 * Kiểm tra hiệu ứng fade out đã hoàn thành chưa
 * @param {object} enemy - Kẻ địch có fade effect
 * @returns {boolean} True nếu fade đã hoàn thành
 */
export const isFadeOutComplete = (enemy) => {
  if (!enemy.fadeStartTime) return false;
  const fadeTime = Date.now() - enemy.fadeStartTime;
  return fadeTime > GAME_CONFIG.fadeOutDuration;
};

/**
 * Tìm kẻ địch mục tiêu dựa trên chữ cái đầu tiên
 * Logic: nếu có nhiều từ cùng chữ cái đầu, chọn từ ở vị trí thấp hơn (y cao hơn)
 * @param {array} enemies - Danh sách kẻ địch
 * @param {string} letter - Chữ cái đầu tiên
 * @returns {object|null} Kẻ địch được chọn hoặc null
 */
export const findTargetEnemyByFirstLetter = (enemies, letter) => {
  const candidateEnemies = enemies
    .filter(
      (enemy) =>
        enemy.state === ENEMY_STATES.ALIVE &&
        enemy.word.toLowerCase().startsWith(letter.toLowerCase())
    )
    .sort((a, b) => b.y - a.y); // Sắp xếp theo y giảm dần (vị trí thấp hơn = y cao hơn)

  return candidateEnemies[0] || null;
};

/**
 * Tạo một viên đạn mới bay từ trụ súng đến vị trí dự đoán của kẻ địch
 * Sử dụng lead targeting để bắn trúng mục tiêu đang di chuyển
 * @param {object} targetEnemy - Kẻ địch mục tiêu
 * @returns {object} Bullet object
 */
export const createBullet = (targetEnemy) => {
  const turretX = GAME_CONFIG.width / 2;
  const turretY = GAME_CONFIG.height - 60;

  // Vị trí hiện tại của kẻ địch (tâm)
  const enemyCenterX = targetEnemy.x + GAME_CONFIG.enemySize / 2;
  const enemyCenterY = targetEnemy.y + GAME_CONFIG.enemySize / 2;

  // Tốc độ đạn và kẻ địch
  const bulletSpeed = GAME_CONFIG.bulletSpeed;
  const enemyVelocityX = 0; // Kẻ địch chỉ rơi thẳng
  const enemyVelocityY = GAME_CONFIG.enemySpeed; // Tốc độ rơi của kẻ địch

  // Tính toán lead targeting - dự đoán vị trí kẻ địch
  const dx = enemyCenterX - turretX;
  const dy = enemyCenterY - turretY;

  // Phương trình bậc 2 để tính thời gian intercept
  const a =
    enemyVelocityX * enemyVelocityX +
    enemyVelocityY * enemyVelocityY -
    bulletSpeed * bulletSpeed;
  const b = 2 * (dx * enemyVelocityX + dy * enemyVelocityY);
  const c = dx * dx + dy * dy;

  let interceptTime = 0;

  // Giải phương trình bậc 2
  const discriminant = b * b - 4 * a * c;
  if (discriminant >= 0 && Math.abs(a) > 0.001) {
    const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);

    // Chọn thời gian dương nhỏ nhất
    interceptTime = Math.min(t1 > 0 ? t1 : Infinity, t2 > 0 ? t2 : Infinity);

    // Nếu không có nghiệm hợp lệ, dùng ước tính đơn giản
    if (interceptTime === Infinity) {
      const distanceToTarget = Math.sqrt(dx * dx + dy * dy);
      interceptTime = distanceToTarget / bulletSpeed;
    }
  } else {
    // Fallback: tính thời gian đơn giản
    const distanceToTarget = Math.sqrt(dx * dx + dy * dy);
    interceptTime = distanceToTarget / bulletSpeed;
  }

  // Vị trí dự đoán của kẻ địch sau thời gian interceptTime
  const predictedX = enemyCenterX + enemyVelocityX * interceptTime;
  const predictedY = enemyCenterY + enemyVelocityY * interceptTime;

  // Tính vector hướng đến vị trí dự đoán
  const targetDx = predictedX - turretX;
  const targetDy = predictedY - turretY;
  const targetDistance = Math.sqrt(targetDx * targetDx + targetDy * targetDy);

  // Đảm bảo không chia cho 0
  const finalDistance = targetDistance > 0 ? targetDistance : 1;

  return {
    id: Date.now() + Math.random(),
    x: turretX,
    y: turretY,
    targetEnemyId: targetEnemy.id,
    velocityX: (targetDx / finalDistance) * bulletSpeed,
    velocityY: (targetDy / finalDistance) * bulletSpeed,
    active: true,
    interceptTime: interceptTime,
  };
};

/**
 * Cập nhật vật lý cho viên đạn
 * @param {object} bullet - Viên đạn cần cập nhật
 * @param {number} deltaTime - Thời gian delta (giây)
 * @returns {object} Bullet object đã được cập nhật
 */
export const updateBulletPhysics = (bullet, deltaTime) => {
  return {
    ...bullet,
    x: bullet.x + bullet.velocityX * deltaTime,
    y: bullet.y + bullet.velocityY * deltaTime,
  };
};

/**
 * Kiểm tra viên đạn có trong màn hình không
 * @param {object} bullet - Viên đạn cần kiểm tra
 * @returns {boolean} True nếu trong màn hình
 */
export const isBulletInBounds = (bullet) => {
  return (
    bullet.x >= -50 &&
    bullet.x <= GAME_CONFIG.width + 50 &&
    bullet.y >= -50 &&
    bullet.y <= GAME_CONFIG.height + 50 &&
    bullet.active
  );
};

/**
 * Kiểm tra va chạm giữa đạn và kẻ địch
 * @param {object} bullet - Viên đạn
 * @param {object} enemy - Kẻ địch
 * @returns {boolean} True nếu có va chạm
 */
export const checkBulletEnemyCollision = (bullet, enemy) => {
  if (
    enemy.state !== ENEMY_STATES.ALIVE &&
    enemy.state !== ENEMY_STATES.TARGETED
  )
    return false;

  // Tính khoảng cách giữa đạn và tâm kẻ địch
  const enemyCenterX = enemy.x + GAME_CONFIG.enemySize / 2;
  const enemyCenterY = enemy.y + GAME_CONFIG.enemySize / 2;
  const distance = Math.sqrt(
    Math.pow(bullet.x - enemyCenterX, 2) + Math.pow(bullet.y - enemyCenterY, 2)
  );

  // Va chạm nếu đạn chạm đến kẻ địch (hit radius tăng lên để dễ hit hơn)
  const hitRadius = 25; // Tăng từ 15 lên 25 để dễ hit hơn
  return distance <= hitRadius;
};

/**
 * Tính góc xoay của viên đạn dựa trên velocity
 * @param {object} bullet - Viên đạn
 * @returns {number} Góc xoay (degree)
 */
export const calculateBulletRotation = (bullet) => {
  // Tính góc xoay của đạn dựa trên velocity (thêm 90 độ vì đạn mặc định hướng lên)
  return Math.atan2(bullet.velocityY, bullet.velocityX) * (180 / Math.PI) + 90;
};

/**
 * Tính hiệu ứng fade out cho kẻ địch
 * @param {object} enemy - Kẻ địch
 * @returns {object} Object chứa opacity và scale
 */
export const calculateEnemyFadeEffect = (enemy) => {
  let opacity = 1;
  let scale = 1;

  if (enemy.state === ENEMY_STATES.MATCHED) {
    // Tính hiệu ứng fade out
    if (enemy.fadeStartTime) {
      const fadeTime = Date.now() - enemy.fadeStartTime;
      const fadeProgress = Math.min(fadeTime / GAME_CONFIG.fadeOutDuration, 1);
      opacity = 1 - fadeProgress;
      scale = 1 + fadeProgress * 0.5; // Scale up khi fade
    } else {
      opacity = 0.3;
      scale = 1.2;
    }
  } else if (enemy.state === ENEMY_STATES.TARGETED) {
    // Giữ nguyên hiển thị bình thường khi được target, không thay đổi gì
    opacity = 1;
    scale = 1;
  }

  return { opacity, scale };
};

/**
 * Kiểm tra delta time có hợp lệ không
 * @param {number} deltaTime - Delta time cần kiểm tra
 * @returns {boolean} True nếu hợp lệ
 */
export const isValidDeltaTime = (deltaTime) => {
  return deltaTime > 0 && deltaTime <= 0.1; // Bỏ qua frame nếu delta time quá lớn
};

/**
 * Kiểm tra input key có hợp lệ không (chỉ a-z)
 * @param {string} key - Key cần kiểm tra
 * @returns {boolean} True nếu hợp lệ
 */
export const isValidInputKey = (key) => {
  return /^[a-z]$/.test(key);
};

/**
 * Tính toán vị trí trung tâm để hiển thị text cho từ đã chọn
 * @param {string} word - Từ cần hiển thị
 * @param {number} enemyX - Vị trí X của kẻ địch
 * @returns {object} Object chứa startX và charWidth
 */
export const calculateWordDisplayPosition = (word, enemyX) => {
  const centerX = enemyX + GAME_CONFIG.enemySize / 2;
  const charWidth = GAME_CONFIG.fontSize * 0.55; // Điều chỉnh hệ số cho chính xác hơn
  const totalWidth = word.length * charWidth;
  const startX = centerX - totalWidth / 2;

  return { startX, charWidth };
};
