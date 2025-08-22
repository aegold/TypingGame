import React, { useState, useEffect, useRef, useCallback } from "react";
import { Stage, Layer, Text, Rect, Circle } from "react-konva";
import useShootSound from "../hooks/useShootSound";
import useExplosionSound from "../hooks/useExplosionSound";
import "../styles/TypingDefenseGame.css";

/**
 * TypingDefenseGame Component
 *
 * Trò chơi phòng thủ bằng cách gõ từ - dành cho trẻ em
 * Mô tả game:
 * - Các quái vật rơi từ trên xuống, mỗi con mang theo một từ
 * - Người chơi phải gõ đúng từ đó để tiêu diệt quái vật
 * - Nếu quái vật chạm đáy màn hình thì game over
 * - Mỗi quái vật tiêu diệt được 10 điểm
 * - Tốc độ rơi và tần suất xuất hiện quái vật cố định
 */

/**
 * Danh sách từ tiếng Anh đơn giản phù hợp với trẻ em
 * Bao gồm: động vật, đồ vật, màu sắc, tính từ cơ bản
 */
const WORD_LIST = [
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
 * Cấu hình game - các thông số có thể điều chỉnh
 * width: chiều rộng màn hình game (800px)
 * height: chiều cao màn hình game (600px)
 * enemySpeed: tốc độ rơi của quái vật (50 pixel/giây)
 * enemySpawnRate: thời gian giữa các lần xuất hiện quái vật (2 giây)
 * enemySize: kích thước quái vật (60px)
 * fontSize: cỡ chữ hiển thị trên quái vật (16px)
 * colors: bảng màu của game
 */
const GAME_CONFIG = {
  width: 800,
  height: 600,
  enemySpeed: 50, // tốc độ rơi: pixel/giây
  enemySpawnRate: 2000, // tần suất xuất hiện: mili giây
  enemySize: 60,
  fontSize: 16,
  colors: {
    background: "#B8E6FF", // màu nền trời xanh sáng hơn
    enemy: "#FF6B6B", // màu quái vật đỏ
    enemyText: "#000000", // màu chữ đen để dễ đọc trên nền sáng
    score: "#2E8B57", // màu điểm số xanh lá
    input: "#4A90E2", // màu input xanh dương
  },
};

const TypingDefenseGame = ({ onGameOver, onScoreUpdate }) => {
  /**
   * Các state chính của game:
   * gameState: trạng thái game ('ready' = sẵn sàng, 'playing' = đang chơi, 'gameOver' = kết thúc)
   * score: điểm số hiện tại của người chơi
   * enemies: mảng chứa tất cả quái vật đang có trên màn hình
   * currentInput: nội dung người dùng đang gõ (bây giờ dùng để theo dõi từ đang gõ)
   * selectedEnemyId: ID của quái vật đang được chọn để gõ
   * typedText: văn bản đã gõ cho từ hiện tại
   * lastTime: thời gian frame trước đó (dùng để tính delta time)
   * bullets: mảng chứa các viên đạn đang bay trên màn hình
   */
  const [gameState, setGameState] = useState("ready");
  const [score, setScore] = useState(0);
  const [enemies, setEnemies] = useState([]);
  const [selectedEnemyId, setSelectedEnemyId] = useState(null);
  const [typedText, setTypedText] = useState("");
  const [lastTime, setLastTime] = useState(0);
  const [bullets, setBullets] = useState([]);
  const [displayStatus, setDisplayStatus] = useState(""); // Trạng thái: success, fail, typing

  /**
   * Các refs để truy cập DOM và quản lý animation:
   * animationRef: ID của requestAnimationFrame để có thể cancel
   * spawnTimerRef: ID của setInterval tạo quái vật để có thể clear
   */
  const animationRef = useRef();
  const spawnTimerRef = useRef();

  /**
   * Custom hook để phát âm thanh
   * useShootSound: âm thanh bắn súng (shoot.mp3)
   * useExplosionSound: âm thanh nổ khi tiêu diệt kẻ địch (explosion.mp3)
   */
  const { playShootSound } = useShootSound();
  const { playExplosionSound } = useExplosionSound();

  /**
   * Lấy một từ ngẫu nhiên từ danh sách WORD_LIST
   * Sử dụng Math.random() để chọn index ngẫu nhiên
   * useCallback để tránh tạo lại function không cần thiết
   */
  const getRandomWord = useCallback(() => {
    return WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
  }, []);

  /**
   * Tạo một viên đạn mới bay từ trụ súng đến vị trí dự đoán của quái vật
   * Sử dụng lead targeting để bắn trúng mục tiêu đang di chuyển
   * @param {object} targetEnemy - Quái vật mục tiêu
   */
  const createBullet = useCallback((targetEnemy) => {
    const turretX = GAME_CONFIG.width / 2;
    const turretY = GAME_CONFIG.height - 60;

    // Vị trí hiện tại của kẻ địch (tâm)
    const enemyCenterX = targetEnemy.x + GAME_CONFIG.enemySize / 2;
    const enemyCenterY = targetEnemy.y + GAME_CONFIG.enemySize / 2;

    // Tốc độ đạn và kẻ địch
    const bulletSpeed = 500; // Tăng tốc độ đạn để dễ bắn trúng
    const enemyVelocityX = 0; // Kẻ địch chỉ rơi thẳng
    const enemyVelocityY = GAME_CONFIG.enemySpeed; // Tốc độ rơi của kẻ địch

    // Tính toán lead targeting - dự đoán vị trí kẻ địch
    // Giải phương trình để tìm thời gian đạn bay đến mục tiêu
    const dx = enemyCenterX - turretX;
    const dy = enemyCenterY - turretY;

    // Phương trình bậc 2 để tính thời gian intercept
    // |bulletPos(t) - enemyPos(t)| = 0
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
      interceptTime: interceptTime, // Debug info
    };
  }, []);

  /**
   * Tạo một quái vật mới với thuộc tính:
   * - id: unique identifier (timestamp + random)
   * - x: vị trí ngang ngẫu nhiên (không vượt quá màn hình)
   * - y: bắt đầu từ trên đầu màn hình (âm để từ từ xuất hiện)
   * - word: từ ngẫu nhiên mà người chơi cần gõ
   * - matched: đã bị tiêu diệt hay chưa
   */
  const createEnemy = useCallback(() => {
    const x = Math.random() * (GAME_CONFIG.width - GAME_CONFIG.enemySize);
    return {
      id: Date.now() + Math.random(),
      x: x,
      y: -GAME_CONFIG.enemySize,
      word: getRandomWord(),
      matched: false,
    };
  }, [getRandomWord]);

  /**
   * Bắt đầu game mới:
   * 1. Chuyển state sang 'playing'
   * 2. Reset tất cả dữ liệu về 0
   * 3. Focus vào ô input để người chơi có thể gõ ngay
   * 4. Bắt đầu timer tạo quái vật định kỳ
   */
  const startGame = useCallback(() => {
    setGameState("playing");
    setScore(0);
    setEnemies([]);
    setSelectedEnemyId(null);
    setTypedText("");
    setLastTime(performance.now());
    setBullets([]);

    // Bắt đầu tạo quái vật định kỳ theo GAME_CONFIG.enemySpawnRate
    spawnTimerRef.current = setInterval(() => {
      setEnemies((prev) => [...prev, createEnemy()]);
    }, GAME_CONFIG.enemySpawnRate);
  }, [createEnemy]);

  /**
   * Kết thúc game:
   * 1. Chuyển state sang 'gameOver'
   * 2. Dừng tất cả timer và animation
   * 3. Gọi callback onGameOver để parent component xử lý (lưu điểm, etc.)
   */
  const stopGame = useCallback(() => {
    setGameState("gameOver");

    // Dừng timer tạo quái vật
    if (spawnTimerRef.current) {
      clearInterval(spawnTimerRef.current);
    }

    // Dừng animation loop
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Thông báo cho parent component game đã kết thúc
    if (onGameOver) {
      onGameOver(score);
    }
  }, [score, onGameOver]);

  /**
   * Game loop chính - được gọi mỗi frame:
   * 1. Tính toán delta time (thời gian giữa các frame)
   * 2. Di chuyển tất cả quái vật xuống dưới
   * 3. Di chuyển tất cả viên đạn và kiểm tra va chạm
   * 4. Kiểm tra xem có quái vật nào chạm đáy không
   * 5. Loại bỏ quái vật đã ra khỏi màn hình hoặc đã bị tiêu diệt
   * 6. Lên lịch frame tiếp theo
   */
  const updateGame = useCallback(
    (currentTime) => {
      // Chỉ chạy khi game đang trong trạng thái 'playing'
      if (gameState !== "playing") return;

      // Tính delta time để chuyển động mượt mà bất kể framerate
      const deltaTime = (currentTime - lastTime) / 1000; // chuyển từ millisecond sang second

      // Kiểm tra delta time hợp lệ để tránh jump
      if (deltaTime > 0.1) return; // Bỏ qua frame nếu delta time quá lớn

      setLastTime(currentTime);

      setEnemies((prevEnemies) => {
        // Di chuyển tất cả quái vật xuống dưới
        const updatedEnemies = prevEnemies.map((enemy) => ({
          ...enemy,
          y: enemy.y + GAME_CONFIG.enemySpeed * deltaTime,
        }));

        // Kiểm tra xem có quái vật nào chạm đáy màn hình không
        const reachedBottom = updatedEnemies.some(
          (enemy) =>
            enemy.y >= GAME_CONFIG.height - GAME_CONFIG.enemySize &&
            !enemy.matched
        );

        // Nếu có quái vật chạm đáy, game over
        if (reachedBottom) {
          stopGame();
          return updatedEnemies;
        }

        // Loại bỏ quái vật đã ra khỏi màn hình hoặc đã bị tiêu diệt
        return updatedEnemies.filter((enemy) => {
          // Giữ lại kẻ địch trong màn hình và chưa bị matched
          const inScreen = enemy.y < GAME_CONFIG.height + 50;
          const isAlive = !enemy.matched;

          // Nếu kẻ địch bị matched, cho hiệu ứng fade out 500ms trước khi xóa
          if (enemy.matched && !enemy.fadeStartTime) {
            enemy.fadeStartTime = Date.now();
            return true; // Giữ lại để fade out
          }

          if (enemy.matched && enemy.fadeStartTime) {
            const fadeTime = Date.now() - enemy.fadeStartTime;
            if (fadeTime > 500) {
              return false; // Xóa sau 500ms
            }
            return true; // Vẫn đang fade
          }

          return inScreen && isAlive;
        });
      });

      // Cập nhật viên đạn và kiểm tra va chạm
      setBullets((prevBullets) => {
        const updatedBullets = prevBullets
          .map((bullet) => ({
            ...bullet,
            x: bullet.x + bullet.velocityX * deltaTime,
            y: bullet.y + bullet.velocityY * deltaTime,
          }))
          .filter((bullet) => {
            // Kiểm tra va chạm với kẻ địch
            const targetEnemy = enemies.find(
              (e) => e.id === bullet.targetEnemyId
            );
            if (targetEnemy && !targetEnemy.matched) {
              // Tính khoảng cách giữa đạn và tâm kẻ địch
              const enemyCenterX = targetEnemy.x + GAME_CONFIG.enemySize / 2;
              const enemyCenterY = targetEnemy.y + GAME_CONFIG.enemySize / 2;
              const distance = Math.sqrt(
                Math.pow(bullet.x - enemyCenterX, 2) +
                  Math.pow(bullet.y - enemyCenterY, 2)
              );

              // Va chạm nếu đạn ở trong bán kính kẻ địch (với margin)
              const hitRadius = GAME_CONFIG.enemySize / 2 + 5; // Thêm 5px margin
              if (distance <= hitRadius) {
                // Đánh dấu kẻ địch bị tiêu diệt ngay lập tức
                setEnemies((prev) =>
                  prev.map((enemy) =>
                    enemy.id === bullet.targetEnemyId
                      ? { ...enemy, matched: true }
                      : enemy
                  )
                );

                // Phát âm thanh nổ khi tiêu diệt kẻ địch
                playExplosionSound();

                // Loại bỏ đạn đã bắn trúng
                return false;
              }
            }

            // Loại bỏ đạn ra khỏi màn hình
            return (
              bullet.x >= -50 &&
              bullet.x <= GAME_CONFIG.width + 50 &&
              bullet.y >= -50 &&
              bullet.y <= GAME_CONFIG.height + 50 &&
              bullet.active
            );
          });

        return updatedBullets;
      });

      // Lên lịch frame tiếp theo
      animationRef.current = requestAnimationFrame(updateGame);
    },
    [gameState, lastTime, stopGame, playExplosionSound, enemies]
  );

  /**
   * Hàm phụ trợ: Tìm quái vật phù hợp dựa trên chữ cái đầu tiên
   * Logic: nếu có nhiều từ cùng chữ cái đầu, chọn từ ở vị trí thấp hơn (y cao hơn)
   */
  const findTargetEnemyByFirstLetter = useCallback(
    (letter) => {
      const candidateEnemies = enemies
        .filter(
          (enemy) =>
            !enemy.matched &&
            enemy.word.toLowerCase().startsWith(letter.toLowerCase())
        )
        .sort((a, b) => b.y - a.y); // Sắp xếp theo y giảm dần (vị trí thấp hơn = y cao hơn)

      return candidateEnemies[0] || null;
    },
    [enemies]
  );

  /**
   * Xử lý khi người chơi nhấn phím (thay thế handleInputChange cũ)
   * Logic mới:
   * 1. Nếu chưa chọn từ nào: chọn từ dựa trên chữ cái đầu tiên
   * 2. Nếu đã chọn từ: tiếp tục gõ từ đó cho đến khi hoàn thành
   * 3. Khi hoàn thành từ: tiêu diệt quái vật và reset
   */
  const handleKeyInput = useCallback(
    (e) => {
      if (gameState !== "playing") return;

      const key = e.key.toLowerCase();

      // Chỉ xử lý các chữ cái a-z
      if (!/^[a-z]$/.test(key)) return;

      // Nếu chưa chọn từ nào, tìm từ phù hợp dựa trên chữ cái đầu
      if (!selectedEnemyId) {
        const targetEnemy = findTargetEnemyByFirstLetter(key);
        if (targetEnemy) {
          setSelectedEnemyId(targetEnemy.id);
          setTypedText(key);
          setDisplayStatus("typing");
        }
        return;
      }

      // Nếu đã chọn từ, tiếp tục gõ
      const selectedEnemy = enemies.find(
        (enemy) => enemy.id === selectedEnemyId
      );
      if (!selectedEnemy || selectedEnemy.matched) {
        // Từ đã bị xóa hoặc matched, reset và thử chọn từ mới
        setSelectedEnemyId(null);
        setTypedText("");
        // Không gọi lại handleKeyInput để tránh vòng lặp vô hạn
        return;
      }
      const newTypedText = typedText + key;
      const targetWord = selectedEnemy.word.toLowerCase();

      // Kiểm tra xem chữ gõ có đúng không
      if (targetWord.startsWith(newTypedText)) {
        setTypedText(newTypedText);

        // Kiểm tra xem đã gõ xong từ chưa
        if (newTypedText === targetWord) {
          // Hoàn thành từ - tạo viên đạn bắn về phía quái vật
          const bullet = createBullet(selectedEnemy);
          setBullets((prev) => [...prev, bullet]);

          // Đánh dấu quái vật sẽ bị tiêu diệt (nhưng chờ đạn bắn trúng)
          setEnemies((prev) =>
            prev.map((enemy) =>
              enemy.id === selectedEnemyId
                ? { ...enemy, targeted: true }
                : enemy
            )
          );

          // Tăng điểm số
          const newScore = score + 10;
          setScore(newScore);

          // Thông báo điểm mới cho parent component
          if (onScoreUpdate) {
            onScoreUpdate(newScore);
          }

          // Phát âm thanh bắn súng (shoot.mp3)
          playShootSound();

          // Reset selection và xóa text ngay lập tức
          setSelectedEnemyId(null);
          setTypedText("");
          setDisplayStatus("");

          // Hệ thống va chạm sẽ tự động xử lý việc tiêu diệt kẻ địch
          // Không cần setTimeout nữa
        }
      } else {
        // Gõ sai, hiển thị fail và reset selection
        setDisplayStatus("fail");

        // Reset selection
        setSelectedEnemyId(null);
        setTypedText("");

        // Xóa display status sau 800ms
        setTimeout(() => {
          setDisplayStatus("");
        }, 800);
      }
    },
    [
      gameState,
      selectedEnemyId,
      typedText,
      enemies,
      score,
      onScoreUpdate,
      playShootSound,
      findTargetEnemyByFirstLetter,
      createBullet,
    ]
  );

  /**
   * Xử lý các phím đặc biệt và chữ cái:
   * - Chữ cái a-z: xử lý logic game (chọn từ, gõ từ)
   * - Enter: khởi động lại game khi đang ở trạng thái 'gameOver'
   * - Escape: thoát game và quay lại trang trước đó
   */
  const handleKeyPress = useCallback(
    (e) => {
      // Xử lý chữ cái khi đang chơi
      if (gameState === "playing" && /^[a-zA-Z]$/.test(e.key)) {
        handleKeyInput(e);
      }

      // Phím Enter: chơi lại khi game over
      if (e.key === "Enter" && gameState === "gameOver") {
        startGame();
      }

      // Phím ESC: thoát game
      if (e.key === "Escape") {
        // Gọi callback để parent component xử lý (lưu điểm nếu cần)
        if (onGameOver) {
          onGameOver(score);
        }
        // Quay lại trang trước đó
        window.history.back();
      }
    },
    [gameState, handleKeyInput, startGame, onGameOver, score]
  );

  /**
   * Effect: Khởi động animation loop khi game bắt đầu
   * Chỉ chạy khi gameState = 'playing'
   * Cleanup: hủy animation khi component unmount hoặc game dừng
   */
  useEffect(() => {
    if (gameState === "playing") {
      animationRef.current = requestAnimationFrame(updateGame);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, updateGame]);

  /**
   * Effect: Cleanup khi component unmount
   * Đảm bảo không có timer hoặc animation nào chạy sau khi component bị destroy
   */
  useEffect(() => {
    return () => {
      if (spawnTimerRef.current) {
        clearInterval(spawnTimerRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  /**
   * Effect: Đăng ký keyboard event listener để bắt phím từ toàn bộ trang
   * Thay thế input field bằng keyboard listening
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Chỉ xử lý khi game đang chạy
      if (gameState === "playing") {
        handleKeyPress(e);
      }
    };

    // Đăng ký event listener
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup khi component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyPress, gameState]);

  /**
   * Component con để render một quái vật:
   * - Vẽ hình tròn màu đỏ làm thân quái vật
   * - Hiển thị từ ở dưới quái vật với highlight nếu được chọn
   * - Hiển thị phần đã gõ bằng màu khác
   * - Áp dụng hiệu ứng khi bị tiêu diệt (mờ đi và to ra)
   */
  const Enemy = ({ enemy }) => {
    // Hiệu ứng visual khi quái vật bị tiêu diệt hoặc đang bị nhắm
    let opacity = 1;
    let scale = 1;

    if (enemy.matched) {
      // Tính hiệu ứng fade out
      if (enemy.fadeStartTime) {
        const fadeTime = Date.now() - enemy.fadeStartTime;
        const fadeProgress = Math.min(fadeTime / 500, 1); // 500ms fade
        opacity = 1 - fadeProgress;
        scale = 1 + fadeProgress * 0.5; // Scale up khi fade
      } else {
        opacity = 0.3;
        scale = 1.2;
      }
    } else if (enemy.targeted) {
      opacity = 0.8;
      scale = 1.1;
    }

    // Kiểm tra xem quái vật này có đang được chọn không
    const isSelected = selectedEnemyId === enemy.id;

    // Tính toán phần đã gõ và phần chưa gõ
    const typedPart = isSelected ? typedText : "";
    const remainingPart = isSelected
      ? enemy.word.slice(typedText.length)
      : enemy.word;

    return (
      <>
        {/* Thân quái vật - hình tròn với màu khác nếu được chọn */}
        <Circle
          x={enemy.x + GAME_CONFIG.enemySize / 2}
          y={enemy.y + GAME_CONFIG.enemySize / 2}
          radius={GAME_CONFIG.enemySize / 2}
          fill={isSelected ? "#FF4444" : GAME_CONFIG.colors.enemy}
          stroke={isSelected ? "#FFD700" : "transparent"}
          strokeWidth={isSelected ? 3 : 0}
          opacity={opacity}
          scaleX={scale}
          scaleY={scale}
        />

        {/* Từ hiển thị dưới quái vật */}
        {isSelected ? (
          // Khi được chọn: hiển thị phần đã gõ (xanh) và phần chưa gõ (xám) liền kề nhau
          <>
            {/* Tính toán vị trí trung tâm của cả từ */}
            {(() => {
              const totalWord = enemy.word;
              const centerX = enemy.x + GAME_CONFIG.enemySize / 2;
              const charWidth = GAME_CONFIG.fontSize * 0.55; // Điều chỉnh hệ số cho chính xác hơn
              const totalWidth = totalWord.length * charWidth;
              const startX = centerX - totalWidth / 2;

              return (
                <>
                  {/* Phần đã gõ - màu xanh lá */}
                  {typedPart && (
                    <Text
                      x={startX}
                      y={enemy.y + GAME_CONFIG.enemySize + 5}
                      text={typedPart}
                      fontSize={GAME_CONFIG.fontSize}
                      fontFamily="Arial"
                      fill="#00FF00"
                      align="left"
                      opacity={opacity}
                    />
                  )}
                  {/* Phần chưa gõ - màu xám */}
                  {remainingPart && (
                    <Text
                      x={startX + typedPart.length * charWidth}
                      y={enemy.y + GAME_CONFIG.enemySize + 5}
                      text={remainingPart}
                      fontSize={GAME_CONFIG.fontSize}
                      fontFamily="Arial"
                      fill="#888888"
                      align="left"
                      opacity={opacity}
                    />
                  )}
                </>
              );
            })()}
          </>
        ) : (
          // Khi không được chọn: hiển thị bình thường
          <Text
            x={enemy.x}
            y={enemy.y + GAME_CONFIG.enemySize + 5}
            width={GAME_CONFIG.enemySize}
            text={enemy.word}
            fontSize={GAME_CONFIG.fontSize}
            fontFamily="Arial"
            fill={GAME_CONFIG.colors.enemyText}
            align="center"
            opacity={opacity}
          />
        )}
      </>
    );
  };

  /**
   * Component con để render trụ súng
   */
  const Turret = () => {
    const turretX = GAME_CONFIG.width / 2;
    const turretY = GAME_CONFIG.height - 60;

    return (
      <>
        {/* Đế trụ súng - hình chữ nhật */}
        <Rect
          x={turretX - 25}
          y={turretY + 10}
          width={50}
          height={30}
          fill="#4A4A4A"
          cornerRadius={5}
        />
        {/* Thân súng - hình tròn */}
        <Circle
          x={turretX}
          y={turretY}
          radius={20}
          fill="#666666"
          stroke="#333333"
          strokeWidth={2}
        />
        {/* Nòng súng - hình chữ nhật nhỏ */}
        <Rect
          x={turretX - 3}
          y={turretY - 25}
          width={6}
          height={20}
          fill="#333333"
          cornerRadius={3}
        />
      </>
    );
  };

  /**
   * Component con để render viên đạn với hướng bay
   */
  const Bullet = ({ bullet }) => {
    // Tính góc xoay của đạn dựa trên velocity (thêm 90 độ vì đạn mặc định hướng lên)
    const angle =
      Math.atan2(bullet.velocityY, bullet.velocityX) * (180 / Math.PI) + 90;

    return (
      <>
        {/* Thân đạn chính */}
        <Rect
          x={bullet.x}
          y={bullet.y}
          width={6}
          height={16}
          fill="#FFD700"
          stroke="#FFA500"
          strokeWidth={1}
          cornerRadius={3}
          rotation={angle}
          offsetX={3} // Đặt trục xoay ở giữa chiều ngang
          offsetY={8} // Đặt trục xoay ở giữa chiều dọc
        />

        {/* Đầu đạn nhọn */}
        <Circle
          x={bullet.x}
          y={bullet.y}
          radius={2}
          fill="#FF6B00"
          offsetX={2}
          offsetY={-6} // Đặt đầu đạn ở phía trước
          rotation={angle}
        />

        {/* Hiệu ứng trail đạn */}
        <Rect
          x={bullet.x}
          y={bullet.y}
          width={2}
          height={8}
          fill="#FFEA00"
          opacity={0.6}
          rotation={angle}
          offsetX={1}
          offsetY={-4} // Trail ở phía sau đạn
        />
      </>
    );
  };

  return (
    <div className="typing-defense-game">
      <div className="game-header">
        <div className="score-display">Score: {score}</div>
        {/* Hiển thị "Game Over" ở giữa header khi game kết thúc */}
        {gameState === "gameOver" && (
          <div className="game-over-center">Game Over</div>
        )}
        <div className="game-controls">
          {gameState === "ready" && (
            <button className="start-button" onClick={startGame}>
              Bắt đầu trò chơi
            </button>
          )}
          {gameState === "playing" && (
            <button className="stop-button" onClick={stopGame}>
              Dừng
            </button>
          )}
          {gameState === "gameOver" && (
            <button className="restart-button" onClick={startGame}>
              Chơi lại
            </button>
          )}
        </div>
      </div>

      <div className="game-container">
        <Stage width={GAME_CONFIG.width} height={GAME_CONFIG.height}>
          <Layer>
            {/* Nền màn hình game - màu xanh da trời */}
            <Rect
              x={0}
              y={0}
              width={GAME_CONFIG.width}
              height={GAME_CONFIG.height}
              fill={GAME_CONFIG.colors.background}
            />

            {/* Render tất cả quái vật đang có trên màn hình */}
            {enemies.map((enemy) => (
              <Enemy key={enemy.id} enemy={enemy} />
            ))}

            {/* Render tất cả viên đạn */}
            {bullets.map((bullet) => (
              <Bullet key={bullet.id} bullet={bullet} />
            ))}

            {/* Render trụ súng */}
            <Turret />

            {/* Display typed text area above turret */}
            {typedText && (
              <Text
                x={GAME_CONFIG.width / 2}
                y={GAME_CONFIG.height - 120}
                text={typedText}
                fontSize={28}
                fontFamily="monospace"
                fontStyle="bold"
                fill={
                  displayStatus === "success"
                    ? "#00FF00"
                    : displayStatus === "fail"
                    ? "#FF0000"
                    : "#333"
                }
                align="center"
                width={200}
                offsetX={100}
              />
            )}

            {/* Vạch đất ở dưới cùng màn hình */}
            <Rect
              x={0}
              y={GAME_CONFIG.height - 10}
              width={GAME_CONFIG.width}
              height={10}
              fill="#8B4513"
            />
          </Layer>
        </Stage>
      </div>

      {/* Hướng dẫn chơi - thay thế input section */}
      <div className="input-section">
        <div className="input-label">
          {gameState === "playing"
            ? selectedEnemyId
              ? `Đang gõ: ${typedText}`
              : "Nhấn chữ cái đầu tiên của từ để chọn quái vật"
            : "Nhấn bàn phím để bắt đầu gõ"}
        </div>
        {gameState === "gameOver" && (
          <div className="restart-hint">
            Ấn Enter để chơi lại hoặc ESC để thoát
          </div>
        )}
        {gameState === "playing" && (
          <div className="exit-hint">Ấn ESC để thoát game</div>
        )}
      </div>

      <div className="game-instructions">
        <h3>Cách chơi:</h3>
        <ul>
          <li>Gõ các từ xuất hiện trên kẻ thù đang rơi</li>
          <li>Tiêu diệt kẻ thù trước khi chúng chạm đất</li>
          <li>Nhận điểm cho mỗi kẻ thù bị tiêu diệt</li>
          <li>Game over nếu một kẻ thù chạm đáy!</li>
        </ul>
      </div>
    </div>
  );
};

export default TypingDefenseGame;
