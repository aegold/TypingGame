import React, { useState, useEffect, useRef, useCallback } from "react";
import { Stage, Layer, Circle, Text, Rect } from "react-konva";
import useShootSound from "../hooks/useShootSound";
import useExplosionSound from "../hooks/useExplosionSound";
import "../styles/TypingFruitGame.css";

/**
 * TypingFruitGame Component
 *
 * Game 2D giống Fruit Ninja nhưng sử dụng bàn phím để "cắt" quả
 * Mô tả game:
 * - Các quả được phóng lên theo quỹ đạo parabol rồi rơi xuống
 * - Mỗi quả hiển thị một chữ cái ở giữa
 * - Người chơi gõ phím tương ứng để làm nổ quả đó, được cộng điểm
 * - Nếu quả rơi khỏi màn hình mà chưa bị cắt → mất 1 tim
 * - Game kết thúc khi hết tim (3 tim ban đầu)
 */

/**
 * Cấu hình game mặc định
 */
const DEFAULT_CONFIG = {
  width: 1000,
  height: 650,
  gravity: 1400, // px/s^2
  spawnRateMs: 700, // milliseconds
  maxActive: 5, // số quả tối đa trên màn hình
  letterPool: "abcdefghijklmnopqrstuvwxyz",
  startLives: 3,
  fruitRadius: { min: 20, max: 28 },
  velocityRange: {
    vx: { min: -120, max: 120 },
    vy: { min: -900, max: -700 },
  },
  popDuration: 200, // milliseconds for pop animation
};

/**
 * Màu sắc ngẫu nhiên cho quả
 */
const FRUIT_COLORS = [
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

const TypingFruitGame = ({
  spawnRateMs = DEFAULT_CONFIG.spawnRateMs,
  maxActive = DEFAULT_CONFIG.maxActive,
  gravity = DEFAULT_CONFIG.gravity,
  letterPool = DEFAULT_CONFIG.letterPool,
  startLives = DEFAULT_CONFIG.startLives,
  onGameOver = null,
}) => {
  // === GAME STATE ===
  const [gameState, setGameState] = useState("ready"); // 'ready', 'playing', 'paused', 'gameOver'
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(startLives);
  const [fruits, setFruits] = useState([]);
  const [lastTime, setLastTime] = useState(0);

  // === REFS ===
  const animationRef = useRef();
  const spawnTimerRef = useRef();
  const gameConfigRef = useRef({
    width: DEFAULT_CONFIG.width,
    height: DEFAULT_CONFIG.height,
    gravity,
    spawnRateMs,
    maxActive,
    letterPool,
    startLives,
  });

  // === SOUND HOOKS ===
  const { playShootSound } = useShootSound();
  const { playExplosionSound } = useExplosionSound();

  /**
   * Tạo quả mới với thuộc tính ngẫu nhiên
   */
  const createFruit = useCallback(() => {
    const config = gameConfigRef.current;
    const { width, height } = config;

    // Vị trí spawn ngẫu nhiên ở dưới màn hình
    const spawnX = Math.random() * width;
    const spawnY = height + DEFAULT_CONFIG.fruitRadius.max;

    // Vận tốc ngẫu nhiên
    const vx =
      DEFAULT_CONFIG.velocityRange.vx.min +
      Math.random() *
        (DEFAULT_CONFIG.velocityRange.vx.max -
          DEFAULT_CONFIG.velocityRange.vx.min);
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
      state: "alive", // 'alive', 'popping'
      popStartTime: null,
    };
  }, [letterPool]);

  /**
   * Bắt đầu game mới
   */
  const startGame = useCallback(() => {
    setGameState("playing");
    setScore(0);
    setLives(startLives);
    setFruits([]);
    setLastTime(performance.now());

    // Bắt đầu spawn quả định kỳ
    spawnTimerRef.current = setInterval(() => {
      setFruits((prev) => {
        // Chỉ spawn nếu chưa đạt giới hạn
        if (prev.filter((f) => f.state === "alive").length < maxActive) {
          return [...prev, createFruit()];
        }
        return prev;
      });
    }, spawnRateMs);
  }, [startLives, maxActive, spawnRateMs, createFruit]);

  /**
   * Dừng game
   */
  const stopGame = useCallback(() => {
    setGameState("gameOver");

    // Dừng timer spawn
    if (spawnTimerRef.current) {
      clearInterval(spawnTimerRef.current);
    }

    // Dừng animation loop
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Gọi callback
    if (onGameOver) {
      onGameOver({ score });
    }
  }, [score, onGameOver]);

  /**
   * Pause/Resume game
   */
  const togglePause = useCallback(() => {
    if (gameState === "playing") {
      setGameState("paused");
      if (spawnTimerRef.current) {
        clearInterval(spawnTimerRef.current);
      }
    } else if (gameState === "paused") {
      setGameState("playing");
      setLastTime(performance.now());

      // Restart spawn timer
      spawnTimerRef.current = setInterval(() => {
        setFruits((prev) => {
          if (prev.filter((f) => f.state === "alive").length < maxActive) {
            return [...prev, createFruit()];
          }
          return prev;
        });
      }, spawnRateMs);
    }
  }, [gameState, maxActive, spawnRateMs, createFruit]);

  /**
   * Game loop chính
   */
  const updateGame = useCallback(
    (currentTime) => {
      if (gameState !== "playing") return;

      const deltaTime = (currentTime - lastTime) / 1000; // convert to seconds

      // Validate delta time để tránh jump
      if (deltaTime > 0.1) return;

      setLastTime(currentTime);

      setFruits((prevFruits) => {
        const now = Date.now();
        const config = gameConfigRef.current;
        let livesLost = 0;

        const updatedFruits = prevFruits
          .map((fruit) => {
            if (fruit.state === "alive") {
              // Cập nhật vật lý
              const newVy = fruit.vy + gravity * deltaTime;
              const newX = fruit.x + fruit.vx * deltaTime;
              const newY = fruit.y + fruit.vy * deltaTime;

              return {
                ...fruit,
                x: newX,
                y: newY,
                vy: newVy,
              };
            } else if (fruit.state === "popping") {
              // Kiểm tra thời gian pop animation
              if (
                fruit.popStartTime &&
                now - fruit.popStartTime > DEFAULT_CONFIG.popDuration
              ) {
                return null; // Đánh dấu để xóa
              }
            }

            return fruit;
          })
          .filter((fruit) => {
            if (!fruit) return false; // Xóa các fruit đã pop xong

            // Kiểm tra quả rơi khỏi màn hình
            if (
              fruit.state === "alive" &&
              fruit.y > config.height + fruit.radius + 100
            ) {
              livesLost++;
              return false; // Xóa quả và trừ mạng
            }

            return true;
          });

        // Cập nhật lives nếu có quả rơi
        if (livesLost > 0) {
          setLives((prev) => {
            const newLives = prev - livesLost;
            if (newLives <= 0) {
              // Game over
              setTimeout(() => stopGame(), 100);
            }
            return Math.max(0, newLives);
          });
        }

        return updatedFruits;
      });

      // Lên lịch frame tiếp theo
      animationRef.current = requestAnimationFrame(updateGame);
    },
    [gameState, lastTime, gravity, stopGame]
  );

  /**
   * Xử lý input từ bàn phím
   */
  const handleKeyPress = useCallback(
    (e) => {
      if (gameState !== "playing") return;

      const key = e.key.toLowerCase();

      // Chỉ xử lý a-z
      if (!/^[a-z]$/.test(key)) return;

      // Tìm quả có label trùng khớp
      setFruits((prev) => {
        const matchingFruits = prev.filter(
          (f) => f.state === "alive" && f.label === key
        );

        if (matchingFruits.length === 0) return prev;

        // Chọn quả có y lớn nhất (gần đáy nhất)
        const targetFruit = matchingFruits.reduce((max, current) =>
          current.y > max.y ? current : max
        );

        // Phát âm thanh và cộng điểm
        playExplosionSound();
        setScore((s) => s + 1);

        // Cập nhật state của quả
        return prev.map((fruit) =>
          fruit.id === targetFruit.id
            ? { ...fruit, state: "popping", popStartTime: Date.now() }
            : fruit
        );
      });
    },
    [gameState, playExplosionSound]
  );

  /**
   * Effect: Khởi động animation loop
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
   * Effect: Đăng ký keyboard event listener
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Xử lý phím điều khiển game
      if (e.key === "Escape") {
        if (gameState === "playing" || gameState === "paused") {
          togglePause();
        }
      } else if (e.key === "Enter" && gameState === "gameOver") {
        startGame();
      } else {
        handleKeyPress(e);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress, togglePause, startGame, gameState]);

  /**
   * Effect: Cleanup khi unmount
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
   * Render quả
   */
  const FruitComponent = ({ fruit }) => {
    let opacity = 1;
    let scale = 1;

    if (fruit.state === "popping") {
      // Hiệu ứng pop
      const elapsed = fruit.popStartTime ? Date.now() - fruit.popStartTime : 0;
      const progress = Math.min(elapsed / DEFAULT_CONFIG.popDuration, 1);
      opacity = 1 - progress;
      scale = 1 + progress * 0.5;
    }

    return (
      <>
        {/* Quả */}
        <Circle
          x={fruit.x}
          y={fruit.y}
          radius={fruit.radius}
          fill={fruit.color}
          stroke="#ffffff"
          strokeWidth={2}
          opacity={opacity}
          scaleX={scale}
          scaleY={scale}
        />

        {/* Chữ cái */}
        <Text
          x={fruit.x}
          y={fruit.y}
          text={fruit.label.toUpperCase()}
          fontSize={fruit.radius * 0.8}
          fontFamily="Arial"
          fontStyle="bold"
          fill="#ffffff"
          align="center"
          verticalAlign="middle"
          offsetX={fruit.radius * 0.25}
          offsetY={fruit.radius * 0.25}
          opacity={opacity}
          scaleX={scale}
          scaleY={scale}
        />
      </>
    );
  };

  return (
    <div className="typing-fruit-game">
      {/* HUD */}
      <div className="game-hud">
        <div className="score-display">Score: {score}</div>
        <div className="lives-display">
          {Array.from({ length: startLives }, (_, i) => (
            <span key={i} className={`heart ${i < lives ? "alive" : "dead"}`}>
              ❤️
            </span>
          ))}
        </div>
      </div>

      {/* Game Controls */}
      <div className="game-controls">
        {gameState === "ready" && (
          <button className="start-button" onClick={startGame}>
            Bắt đầu chơi
          </button>
        )}
        {gameState === "playing" && (
          <button className="pause-button" onClick={togglePause}>
            Tạm dừng (ESC)
          </button>
        )}
        {gameState === "paused" && (
          <button className="resume-button" onClick={togglePause}>
            Tiếp tục (ESC)
          </button>
        )}
      </div>

      {/* Game Stage */}
      <div className="game-stage-container">
        <Stage width={DEFAULT_CONFIG.width} height={DEFAULT_CONFIG.height}>
          <Layer>
            {/* Background */}
            <Rect
              x={0}
              y={0}
              width={DEFAULT_CONFIG.width}
              height={DEFAULT_CONFIG.height}
              fill="#87CEEB"
            />

            {/* Render all fruits */}
            {fruits.map((fruit) => (
              <FruitComponent key={fruit.id} fruit={fruit} />
            ))}
          </Layer>
        </Stage>
      </div>

      {/* Pause Overlay */}
      {gameState === "paused" && (
        <div className="game-overlay">
          <div className="overlay-content">
            <h2>Game Paused</h2>
            <p>Nhấn ESC hoặc click Tiếp tục để chơi tiếp</p>
          </div>
        </div>
      )}

      {/* Game Over Overlay */}
      {gameState === "gameOver" && (
        <div className="game-overlay">
          <div className="overlay-content">
            <h2>Game Over!</h2>
            <div className="final-score">Điểm số: {score}</div>
            <button className="restart-button" onClick={startGame}>
              Chơi lại (Enter)
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="game-instructions">
        <h3>Cách chơi:</h3>
        <ul>
          <li>Gõ chữ cái trên quả để "cắt" chúng</li>
          <li>Nếu nhiều quả cùng chữ cái, quả gần đáy sẽ được cắt trước</li>
          <li>Đừng để quả rơi khỏi màn hình!</li>
          <li>Game kết thúc khi hết tim (❤️)</li>
          <li>ESC: Tạm dừng/Tiếp tục</li>
        </ul>
      </div>
    </div>
  );
};

export default TypingFruitGame;
