import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Stage,
  Layer,
  Text,
  Rect,
  Circle,
  Image as KonvaImage,
} from "react-konva";
import useTypingSound from "../hooks/useTypingSound";
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
    background: "#87CEEB", // màu nền trời xanh
    enemy: "#FF6B6B", // màu quái vật đỏ
    enemyText: "#FFFFFF", // màu chữ trắng
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
  const [currentInput, setCurrentInput] = useState("");
  const [selectedEnemyId, setSelectedEnemyId] = useState(null);
  const [typedText, setTypedText] = useState("");
  const [lastTime, setLastTime] = useState(0);
  const [bullets, setBullets] = useState([]);

  /**
   * Các refs để truy cập DOM và quản lý animation:
   * gameRef: tham chiếu đến container game (hiện tại chưa dùng)
   * animationRef: ID của requestAnimationFrame để có thể cancel
   * spawnTimerRef: ID của setInterval tạo quái vật để có thể clear
   */
  const gameRef = useRef();
  const animationRef = useRef();
  const spawnTimerRef = useRef();

  /**
   * Custom hook để phát âm thanh khi người chơi gõ đúng
   */
  const { playSound } = useTypingSound();

  /**
   * Lấy một từ ngẫu nhiên từ danh sách WORD_LIST
   * Sử dụng Math.random() để chọn index ngẫu nhiên
   * useCallback để tránh tạo lại function không cần thiết
   */
  const getRandomWord = useCallback(() => {
    return WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
  }, []);

  /**
   * Tạo một viên đạn mới bay từ trụ súng đến quái vật
   * @param {object} targetEnemy - Quái vật mục tiêu
   */
  const createBullet = useCallback((targetEnemy) => {
    const turretX = GAME_CONFIG.width / 2;
    const turretY = GAME_CONFIG.height - 60;
    const targetX = targetEnemy.x + GAME_CONFIG.enemySize / 2;
    const targetY = targetEnemy.y + GAME_CONFIG.enemySize / 2;

    // Tính toán vector hướng
    const dx = targetX - turretX;
    const dy = targetY - turretY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return {
      id: Date.now() + Math.random(),
      x: turretX,
      y: turretY,
      targetEnemyId: targetEnemy.id,
      velocityX: (dx / distance) * 400, // tốc độ đạn 400 pixel/giây
      velocityY: (dy / distance) * 400,
      active: true,
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
    setCurrentInput("");
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
        return updatedEnemies.filter(
          (enemy) => enemy.y < GAME_CONFIG.height + 50 && !enemy.matched
        );
      });

      // Cập nhật viên đạn
      setBullets((prevBullets) => {
        return prevBullets
          .map((bullet) => ({
            ...bullet,
            x: bullet.x + bullet.velocityX * deltaTime,
            y: bullet.y + bullet.velocityY * deltaTime,
          }))
          .filter((bullet) => {
            // Loại bỏ đạn ra khỏi màn hình
            return (
              bullet.x >= -50 &&
              bullet.x <= GAME_CONFIG.width + 50 &&
              bullet.y >= -50 &&
              bullet.y <= GAME_CONFIG.height + 50 &&
              bullet.active
            );
          });
      });

      // Lên lịch frame tiếp theo
      animationRef.current = requestAnimationFrame(updateGame);
    },
    [gameState, lastTime, stopGame]
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

          // Phát âm thanh thành công
          playSound();

          // Reset selection
          setSelectedEnemyId(null);
          setTypedText("");

          // Loại bỏ quái vật sau khi đạn bay đến (delay dài hơn)
          setTimeout(() => {
            setEnemies((prev) =>
              prev.map((enemy) =>
                enemy.id === selectedEnemyId
                  ? { ...enemy, matched: true }
                  : enemy
              )
            );
            // Xóa đạn đã bắn trúng
            setBullets((prev) =>
              prev.filter((b) => b.targetEnemyId !== selectedEnemyId)
            );

            // Loại bỏ quái vật khỏi danh sách sau khi matched
            setTimeout(() => {
              setEnemies((prev) =>
                prev.filter((enemy) => enemy.id !== selectedEnemyId)
              );
            }, 200);
          }, 800); // Thời gian để đạn bay đến mục tiêu
        }
      } else {
        // Gõ sai, reset selection
        setSelectedEnemyId(null);
        setTypedText("");
      }
    },
    [
      gameState,
      selectedEnemyId,
      typedText,
      enemies,
      score,
      onScoreUpdate,
      playSound,
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
    const opacity = enemy.matched ? 0.3 : enemy.targeted ? 0.7 : 1;
    const scale = enemy.matched ? 1.2 : 1;

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
   * Component con để render viên đạn
   */
  const Bullet = ({ bullet }) => {
    return (
      <Rect
        x={bullet.x - 2}
        y={bullet.y - 8}
        width={4}
        height={16}
        fill="#FFD700"
        stroke="#FFA500"
        strokeWidth={1}
        cornerRadius={2}
      />
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
