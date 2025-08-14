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
   * currentInput: nội dung người dùng đang gõ trong ô input
   * lastTime: thời gian frame trước đó (dùng để tính delta time)
   */
  const [gameState, setGameState] = useState("ready");
  const [score, setScore] = useState(0);
  const [enemies, setEnemies] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [lastTime, setLastTime] = useState(0);

  /**
   * Các refs để truy cập DOM và quản lý animation:
   * gameRef: tham chiếu đến container game (hiện tại chưa dùng)
   * animationRef: ID của requestAnimationFrame để có thể cancel
   * spawnTimerRef: ID của setInterval tạo quái vật để có thể clear
   * inputRef: tham chiếu đến ô input để focus
   */
  const gameRef = useRef();
  const animationRef = useRef();
  const spawnTimerRef = useRef();
  const inputRef = useRef();

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
    setLastTime(performance.now());

    // Tự động focus vào ô input
    if (inputRef.current) {
      inputRef.current.focus();
    }

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
   * 3. Kiểm tra xem có quái vật nào chạm đáy không
   * 4. Loại bỏ quái vật đã ra khỏi màn hình hoặc đã bị tiêu diệt
   * 5. Lên lịch frame tiếp theo
   */
  const updateGame = useCallback(
    (currentTime) => {
      // Chỉ chạy khi game đang trong trạng thái 'playing'
      if (gameState !== "playing") return;

      // Tính delta time để chuyển động mượt mà bất kể framerate
      const deltaTime = (currentTime - lastTime) / 1000; // chuyển từ millisecond sang second
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

      // Lên lịch frame tiếp theo
      animationRef.current = requestAnimationFrame(updateGame);
    },
    [gameState, lastTime, stopGame]
  );

  /**
   * Xử lý khi người dùng gõ vào ô input:
   * 1. Chuyển text về lowercase và trim space
   * 2. Kiểm tra xem có trùng với từ nào trên quái vật không
   * 3. Nếu trùng: đánh dấu quái vật đã bị tiêu diệt, tăng điểm, phát âm thanh
   * 4. Xóa ô input để sẵn sàng cho từ tiếp theo
   * 5. Loại bỏ quái vật sau 200ms (để có hiệu ứng visual)
   */
  const handleInputChange = (e) => {
    const value = e.target.value.toLowerCase().trim();
    setCurrentInput(value);

    // Tìm quái vật có từ trùng với input (chưa bị tiêu diệt)
    const matchedEnemy = enemies.find(
      (enemy) => enemy.word.toLowerCase() === value && !enemy.matched
    );

    if (matchedEnemy) {
      // Đánh dấu quái vật đã bị tiêu diệt
      setEnemies((prev) =>
        prev.map((enemy) =>
          enemy.id === matchedEnemy.id ? { ...enemy, matched: true } : enemy
        )
      );

      // Tăng điểm số (mỗi quái vật = 10 điểm)
      const newScore = score + 10;
      setScore(newScore);

      // Thông báo điểm mới cho parent component
      if (onScoreUpdate) {
        onScoreUpdate(newScore);
      }

      // Xóa input và phát âm thanh thành công
      setCurrentInput("");
      playSound();

      // Loại bỏ quái vật sau delay ngắn để người chơi thấy hiệu ứng
      setTimeout(() => {
        setEnemies((prev) =>
          prev.filter((enemy) => enemy.id !== matchedEnemy.id)
        );
      }, 200);
    }
  };

  /**
   * Xử lý các phím đặc biệt:
   * - Enter: khởi động lại game khi đang ở trạng thái 'gameOver'
   * - Escape: thoát game và quay lại trang trước đó
   */
  const handleKeyPress = (e) => {
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
  };

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
   * Component con để render một quái vật:
   * - Vẽ hình tròn màu đỏ làm thân quái vật
   * - Hiển thị từ ở giữa quái vật
   * - Áp dụng hiệu ứng khi bị tiêu diệt (mờ đi và to ra)
   */
  const Enemy = ({ enemy }) => {
    // Hiệu ứng visual khi quái vật bị tiêu diệt
    const opacity = enemy.matched ? 0.3 : 1; // mờ đi khi bị tiêu diệt
    const scale = enemy.matched ? 1.2 : 1; // to ra khi bị tiêu diệt

    return (
      <>
        {/* Thân quái vật - hình tròn màu đỏ */}
        <Circle
          x={enemy.x + GAME_CONFIG.enemySize / 2}
          y={enemy.y + GAME_CONFIG.enemySize / 2}
          radius={GAME_CONFIG.enemySize / 2}
          fill={GAME_CONFIG.colors.enemy}
          opacity={opacity}
          scaleX={scale}
          scaleY={scale}
        />
        {/* Từ hiển thị dưới quái vật */}
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
      </>
    );
  };

  return (
    <div className="typing-defense-game">
      <div className="game-header">
        <div className="score-display">Score: {score}</div>
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
            <div className="game-over">
              <div className="game-over-text">Game Over!</div>
              <div className="final-score">Final Score: {score}</div>
              <button className="restart-button" onClick={startGame}>
                Chơi lại
              </button>
            </div>
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

      <div className="input-section">
        <div className="input-label">Gõ từ để tiêu diệt quái vật:</div>
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="word-input"
          placeholder="Gõ ở đây..."
          disabled={gameState !== "playing"}
          autoFocus
        />
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
