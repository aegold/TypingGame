import React, { useState, useEffect, useRef, useCallback } from "react";
import { Stage, Layer, Circle, Text, Rect, Line } from "react-konva";
import useShootSound from "../../hooks/useShootSound";
import useSlashSound from "../../hooks/useSlashSound";
import { DEFAULT_CONFIG, GAME_STATES, FRUIT_STATES } from "./config";
import {
  createFruit,
  updateFruitPhysics,
  isFruitOutOfBounds,
  isPopAnimationComplete,
  findTargetFruit,
  calculatePopEffect,
  isValidDeltaTime,
  isValidInputKey,
  createSlashEffect,
  calculateSlashOpacity,
  isSlashEffectComplete,
} from "./utils";
import "../../styles/TypingFruitGame.css";

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
const TypingFruitGame = ({
  spawnRateMs = DEFAULT_CONFIG.spawnRateMs,
  maxActive = DEFAULT_CONFIG.maxActive,
  gravity = DEFAULT_CONFIG.gravity,
  letterPool = DEFAULT_CONFIG.letterPool,
  startLives = DEFAULT_CONFIG.startLives,
  onGameOver = null,
}) => {
  // === GAME STATE ===
  const [gameState, setGameState] = useState(GAME_STATES.READY);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(startLives);
  const [fruits, setFruits] = useState([]);
  const [slashEffects, setSlashEffects] = useState([]); // Mảng chứa slash effects

  // === REFS ===
  const animationRef = useRef();
  const spawnTimerRef = useRef();
  const lastTimeRef = useRef(0); // Dùng ref thay vì state để tránh async issue
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
  const { playSlashSound } = useSlashSound();

  /**
   * Bắt đầu game mới
   */
  const startGame = useCallback(() => {
    setGameState(GAME_STATES.PLAYING);
    setScore(0);
    setLives(startLives);
    setFruits([]);
    setSlashEffects([]); // Reset slash effects

    // Bắt đầu spawn quả định kỳ
    spawnTimerRef.current = setInterval(() => {
      setFruits((prev) => {
        // Chỉ spawn nếu chưa đạt giới hạn
        const aliveFruits = prev.filter((f) => f.state === FRUIT_STATES.ALIVE);
        if (aliveFruits.length < maxActive) {
          const newFruit = createFruit(gameConfigRef.current, letterPool);
          return [...prev, newFruit];
        }
        return prev;
      });
    }, spawnRateMs);
  }, [startLives, maxActive, spawnRateMs, letterPool]);

  /**
   * Dừng game
   */
  const stopGame = useCallback(() => {
    setGameState(GAME_STATES.GAME_OVER);

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
    if (gameState === GAME_STATES.PLAYING) {
      setGameState(GAME_STATES.PAUSED);
      if (spawnTimerRef.current) {
        clearInterval(spawnTimerRef.current);
      }
    } else if (gameState === GAME_STATES.PAUSED) {
      setGameState(GAME_STATES.PLAYING);
      lastTimeRef.current = performance.now();

      // Restart spawn timer
      spawnTimerRef.current = setInterval(() => {
        setFruits((prev) => {
          const aliveFruits = prev.filter(
            (f) => f.state === FRUIT_STATES.ALIVE
          );
          if (aliveFruits.length < maxActive) {
            return [...prev, createFruit(gameConfigRef.current, letterPool)];
          }
          return prev;
        });
      }, spawnRateMs);
    }
  }, [gameState, maxActive, spawnRateMs, letterPool]);

  /**
   * Game loop chính
   */
  const updateGame = useCallback(
    (currentTime) => {
      if (gameState !== GAME_STATES.PLAYING) return;

      // Kiểm tra lastTime có hợp lệ không, nếu chưa có thì khởi tạo
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
        // Tiếp tục animation loop
        animationRef.current = requestAnimationFrame(updateGame);
        return;
      }

      const deltaTime = (currentTime - lastTimeRef.current) / 1000; // convert to seconds

      // Validate delta time để tránh jump
      if (!isValidDeltaTime(deltaTime)) {
        // Tiếp tục animation loop
        animationRef.current = requestAnimationFrame(updateGame);
        return;
      }

      lastTimeRef.current = currentTime;

      setFruits((prevFruits) => {
        const config = gameConfigRef.current;
        let livesLost = 0;

        const updatedFruits = prevFruits
          .map((fruit) => {
            if (fruit.state === FRUIT_STATES.ALIVE) {
              // Cập nhật vật lý
              return updateFruitPhysics(fruit, deltaTime, gravity);
            } else if (fruit.state === FRUIT_STATES.POPPING) {
              // Kiểm tra thời gian pop animation
              if (isPopAnimationComplete(fruit)) {
                return null; // Đánh dấu để xóa
              }
            }

            return fruit;
          })
          .filter((fruit) => {
            if (!fruit) return false; // Xóa các fruit đã pop xong

            // Kiểm tra quả rơi khỏi màn hình
            if (
              fruit.state === FRUIT_STATES.ALIVE &&
              isFruitOutOfBounds(fruit, config)
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

      // Cập nhật slash effects
      setSlashEffects((prevEffects) => {
        return prevEffects.filter((effect) => !isSlashEffectComplete(effect));
      });

      // Lên lịch frame tiếp theo
      animationRef.current = requestAnimationFrame(updateGame);
    },
    [gameState, gravity, stopGame]
  );

  /**
   * Xử lý input từ bàn phím
   */
  const handleKeyPress = useCallback(
    (e) => {
      if (gameState !== GAME_STATES.PLAYING) return;

      const key = e.key.toLowerCase();

      // Chỉ xử lý a-z
      if (!isValidInputKey(key)) return;

      // Tìm quả có label trùng khớp
      setFruits((prev) => {
        const targetFruit = findTargetFruit(prev, key);

        if (!targetFruit) return prev;

        // Phát âm thanh và cộng điểm
        playSlashSound();
        setScore((s) => s + 1);

        // Tạo slash effect
        const slashEffect = createSlashEffect(targetFruit);
        setSlashEffects((prev) => [...prev, slashEffect]);

        // Cập nhật state của quả
        return prev.map((fruit) =>
          fruit.id === targetFruit.id
            ? {
                ...fruit,
                state: FRUIT_STATES.POPPING,
                popStartTime: Date.now(),
              }
            : fruit
        );
      });
    },
    [gameState, playSlashSound]
  );

  /**
   * Effect: Khởi động animation loop
   */
  useEffect(() => {
    if (gameState === GAME_STATES.PLAYING) {
      // Reset lastTime về 0 để updateGame khởi tạo lại
      lastTimeRef.current = 0;
      // Bắt đầu animation loop
      const startAnimation = () => {
        animationRef.current = requestAnimationFrame(updateGame);
      };
      startAnimation();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState]);

  /**
   * Effect: Đăng ký keyboard event listener
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Xử lý phím điều khiển game
      if (e.key === "Escape") {
        if (
          gameState === GAME_STATES.PLAYING ||
          gameState === GAME_STATES.PAUSED
        ) {
          togglePause();
        }
      } else if (e.key === "Enter" && gameState === GAME_STATES.GAME_OVER) {
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
    const { opacity, scale } = calculatePopEffect(fruit);

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
          y={fruit.y - fruit.radius - 15} // Đặt chữ phía trên quả, cách 15px
          text={fruit.label.toUpperCase()}
          fontSize={fruit.radius * 0.8}
          fontFamily="Arial"
          fontStyle="bold"
          fill="#ffffff"
          stroke="#000000" // Thêm viền đen để dễ đọc
          strokeWidth={1}
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
      {/* Game Controls */}
      <div className="game-controls">
        {gameState === GAME_STATES.READY && (
          <button className="start-button" onClick={startGame}>
            Bắt đầu chơi
          </button>
        )}
        {gameState === GAME_STATES.PLAYING && (
          <button className="pause-button" onClick={togglePause}>
            Tạm dừng (ESC)
          </button>
        )}
        {gameState === GAME_STATES.PAUSED && (
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
              fill="#D2B48C"
            />

            {/* HUD bên trong game stage */}
            {/* Score display - góc trái trên */}
            <Text
              x={20}
              y={20}
              text={`Score: ${score}`}
              fontSize={24}
              fontFamily="Arial"
              fontStyle="bold"
              fill="#FFD700"
              stroke="#000000"
              strokeWidth={1}
            />

            {/* Lives display - hiển thị bằng hình trái tim */}
            <Text
              x={DEFAULT_CONFIG.width - 20}
              y={20}
              text={`❤️ ${lives}`}
              fontSize={24}
              fontFamily="Arial"
              fontStyle="bold"
              fill="#FF6B6B"
              stroke="#000000"
              strokeWidth={1}
              align="right"
              offsetX={100} // Căn phải
            />

            {/* Render all fruits */}
            {fruits.map((fruit) => (
              <FruitComponent key={fruit.id} fruit={fruit} />
            ))}

            {/* Render slash effects */}
            {slashEffects.map((effect) => (
              <Line
                key={effect.id}
                points={[
                  effect.startX,
                  effect.startY,
                  effect.endX,
                  effect.endY,
                ]}
                stroke={DEFAULT_CONFIG.slashEffect.color}
                strokeWidth={DEFAULT_CONFIG.slashEffect.lineWidth}
                opacity={calculateSlashOpacity(effect)}
                lineCap="round"
              />
            ))}
          </Layer>
        </Stage>
      </div>

      {/* Pause Overlay */}
      {gameState === GAME_STATES.PAUSED && (
        <div className="game-overlay">
          <div className="overlay-content">
            <h2>Game Paused</h2>
            <p>Nhấn ESC hoặc click Tiếp tục để chơi tiếp</p>
          </div>
        </div>
      )}

      {/* Game Over Overlay */}
      {gameState === GAME_STATES.GAME_OVER && (
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
