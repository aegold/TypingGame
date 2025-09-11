import React, { useState, useEffect, useRef, useCallback } from "react";
import { Stage, Layer, Text, Rect, Circle, Image } from "react-konva";
import useImage from "use-image";
import useShootSound from "../../hooks/useShootSound";
import useExplosionSound from "../../hooks/useExplosionSound";

// Import turret image
import mainShipImage from "../../assets/typing_defense/main_ship.png";

// Import enemy images
import enemy1Image from "../../assets/typing_defense/enemy_1.png";
import enemy2Image from "../../assets/typing_defense/enemy_2.png";
import enemy3Image from "../../assets/typing_defense/enemy_3.png";
import enemy4Image from "../../assets/typing_defense/enemy_4.png";
import enemy5Image from "../../assets/typing_defense/enemy_5.png";
import enemy6Image from "../../assets/typing_defense/enemy_6.png";
import enemy7Image from "../../assets/typing_defense/enemy_7.png";
import enemy8Image from "../../assets/typing_defense/enemy_8.png";
import enemy9Image from "../../assets/typing_defense/enemy_9.png";
import enemy10Image from "../../assets/typing_defense/enemy_10.png";
import enemy11Image from "../../assets/typing_defense/enemy_11.png";
import enemy12Image from "../../assets/typing_defense/enemy_12.png";

import {
  GAME_CONFIG,
  GAME_STATES,
  ENEMY_STATES,
  DISPLAY_STATES,
} from "./config";
import {
  createEnemy,
  updateEnemyPhysics,
  isEnemyOutOfBounds,
  isEnemyInBounds,
  isFadeOutComplete,
  findTargetEnemyByFirstLetter,
  createBullet,
  updateBulletPhysics,
  isBulletInBounds,
  checkBulletEnemyCollision,
  calculateBulletRotation,
  calculateEnemyFadeEffect,
  isValidDeltaTime,
  isValidInputKey,
  calculateWordDisplayPosition,
} from "./utils";
import "../../styles/TypingDefenseGame.css";

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
const TypingDefenseGame = ({ onGameOver, onScoreUpdate }) => {
  // Load turret image
  const [mainShipImageLoaded] = useImage(mainShipImage);

  // Enemy images array
  const enemyImages = [
    enemy1Image,
    enemy2Image,
    enemy3Image,
    enemy4Image,
    enemy5Image,
    enemy6Image,
    enemy7Image,
    enemy8Image,
    enemy9Image,
    enemy10Image,
    enemy11Image,
    enemy12Image,
  ];

  // Load all enemy images
  const [enemy1ImageLoaded] = useImage(enemy1Image);
  const [enemy2ImageLoaded] = useImage(enemy2Image);
  const [enemy3ImageLoaded] = useImage(enemy3Image);
  const [enemy4ImageLoaded] = useImage(enemy4Image);
  const [enemy5ImageLoaded] = useImage(enemy5Image);
  const [enemy6ImageLoaded] = useImage(enemy6Image);
  const [enemy7ImageLoaded] = useImage(enemy7Image);
  const [enemy8ImageLoaded] = useImage(enemy8Image);
  const [enemy9ImageLoaded] = useImage(enemy9Image);
  const [enemy10ImageLoaded] = useImage(enemy10Image);
  const [enemy11ImageLoaded] = useImage(enemy11Image);
  const [enemy12ImageLoaded] = useImage(enemy12Image);

  // Array of loaded enemy images
  const enemyImagesLoaded = [
    enemy1ImageLoaded,
    enemy2ImageLoaded,
    enemy3ImageLoaded,
    enemy4ImageLoaded,
    enemy5ImageLoaded,
    enemy6ImageLoaded,
    enemy7ImageLoaded,
    enemy8ImageLoaded,
    enemy9ImageLoaded,
    enemy10ImageLoaded,
    enemy11ImageLoaded,
    enemy12ImageLoaded,
  ];

  /**
   * Các state chính của game:
   * gameState: trạng thái game ('ready' = sẵn sàng, 'playing' = đang chơi, 'gameOver' = kết thúc)
   * score: điểm số hiện tại của người chơi
   * enemies: mảng chứa tất cả quái vật đang có trên màn hình
   * selectedEnemyId: ID của quái vật đang được chọn để gõ
   * typedText: văn bản đã gõ cho từ hiện tại
   * lastTime: thời gian frame trước đó (dùng để tính delta time)
   * bullets: mảng chứa các viên đạn đang bay trên màn hình
   * displayStatus: trạng thái hiển thị (success, fail, typing)
   */
  const [gameState, setGameState] = useState(GAME_STATES.READY);
  const [score, setScore] = useState(0);
  const [enemies, setEnemies] = useState([]);
  const [selectedEnemyId, setSelectedEnemyId] = useState(null);
  const [typedText, setTypedText] = useState("");
  const [bullets, setBullets] = useState([]);
  const [displayStatus, setDisplayStatus] = useState(DISPLAY_STATES.NONE);

  /**
   * Các refs để truy cập DOM và quản lý animation:
   * animationRef: ID của requestAnimationFrame để có thể cancel
   * spawnTimerRef: ID của setInterval tạo quái vật để có thể clear
   * lastTimeRef: Ref để track thời gian frame trước đó
   * enemiesRef: Ref để store current enemies state để tránh stale closure
   */
  const animationRef = useRef();
  const spawnTimerRef = useRef();
  const lastTimeRef = useRef(0);
  const enemiesRef = useRef([]);

  /**
   * Custom hook để phát âm thanh
   * useShootSound: âm thanh bắn súng (shoot.mp3)
   * useExplosionSound: âm thanh nổ khi tiêu diệt kẻ địch (explosion.mp3)
   */
  const { playShootSound } = useShootSound();
  const { playExplosionSound } = useExplosionSound();

  /**
   * Tạo enemy với random image
   */
  const createEnemyWithImage = useCallback(() => {
    const enemy = createEnemy();
    // Chọn ngẫu nhiên một enemy image (0-11)
    const randomImageIndex = Math.floor(Math.random() * 12);
    return {
      ...enemy,
      imageIndex: randomImageIndex,
    };
  }, []);

  /**
   * Bắt đầu game mới:
   * 1. Chuyển state sang 'playing'
   * 2. Reset tất cả dữ liệu về 0
   * 3. Bắt đầu timer tạo quái vật định kỳ
   */
  const startGame = useCallback(() => {
    setGameState(GAME_STATES.PLAYING);
    setScore(0);
    setEnemies([]);
    setSelectedEnemyId(null);
    setTypedText("");
    setBullets([]);
    setDisplayStatus(DISPLAY_STATES.NONE);
    lastTimeRef.current = 0;

    // Bắt đầu tạo quái vật định kỳ theo GAME_CONFIG.enemySpawnRate
    spawnTimerRef.current = setInterval(() => {
      setEnemies((prev) => [...prev, createEnemyWithImage()]);
    }, GAME_CONFIG.enemySpawnRate);
  }, []);

  /**
   * Kết thúc game:
   * 1. Chuyển state sang 'gameOver'
   * 2. Dừng tất cả timer và animation
   * 3. Gọi callback onGameOver để parent component xử lý (lưu điểm, etc.)
   */
  const stopGame = useCallback(() => {
    setGameState(GAME_STATES.GAME_OVER);

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
      if (gameState !== GAME_STATES.PLAYING) return;

      // Khởi tạo lastTime nếu chưa có
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
        animationRef.current = requestAnimationFrame(updateGame);
        return;
      }

      // Tính delta time để chuyển động mượt mà bất kể framerate
      const deltaTime = (currentTime - lastTimeRef.current) / 1000; // chuyển từ millisecond sang second

      // Kiểm tra delta time hợp lệ để tránh jump
      if (!isValidDeltaTime(deltaTime)) {
        animationRef.current = requestAnimationFrame(updateGame);
        return;
      }

      lastTimeRef.current = currentTime;

      // Clear destroyed enemies từ frame trước
      const destroyedEnemies = new Set();

      // Cập nhật bullets và detect collisions
      setBullets((prevBullets) => {
        return prevBullets
          .map((bullet) => updateBulletPhysics(bullet, deltaTime))
          .filter((bullet) => {
            // Kiểm tra va chạm với kẻ địch từ enemiesRef (current state)
            const targetEnemy = enemiesRef.current.find(
              (e) =>
                e.id === bullet.targetEnemyId &&
                (e.state === ENEMY_STATES.ALIVE ||
                  e.state === ENEMY_STATES.TARGETED)
            );

            if (targetEnemy && checkBulletEnemyCollision(bullet, targetEnemy)) {
              // Đánh dấu enemy để tiêu diệt
              destroyedEnemies.add(bullet.targetEnemyId);

              // Phát âm thanh nổ khi tiêu diệt kẻ địch
              playExplosionSound();

              // Loại bỏ đạn đã bắn trúng
              return false;
            }

            // Loại bỏ đạn ra khỏi màn hình
            return isBulletInBounds(bullet);
          });
      });

      // Cập nhật enemies
      setEnemies((prevEnemies) => {
        // Di chuyển tất cả quái vật xuống dưới
        let updatedEnemies = prevEnemies.map((enemy) =>
          updateEnemyPhysics(enemy, deltaTime)
        );

        // Kiểm tra xem có quái vật nào chạm đáy màn hình không
        const reachedBottom = updatedEnemies.some(
          (enemy) =>
            isEnemyOutOfBounds(enemy) && enemy.state === ENEMY_STATES.ALIVE
        );

        // Nếu có quái vật chạm đáy, game over
        if (reachedBottom) {
          stopGame();
          return updatedEnemies;
        }

        // Cập nhật state của enemies đã bị tiêu diệt
        updatedEnemies = updatedEnemies.map((enemy) => {
          if (destroyedEnemies.has(enemy.id)) {
            return {
              ...enemy,
              state: ENEMY_STATES.MATCHED,
              fadeStartTime: Date.now(),
            };
          }
          return enemy;
        });

        // Loại bỏ quái vật đã ra khỏi màn hình hoặc đã bị tiêu diệt
        return updatedEnemies.filter((enemy) => {
          const inScreen = isEnemyInBounds(enemy);
          const isAlive = enemy.state === ENEMY_STATES.ALIVE;
          const isTargeted = enemy.state === ENEMY_STATES.TARGETED;
          const isMatched = enemy.state === ENEMY_STATES.MATCHED;

          // Nếu kẻ địch bị matched, kiểm tra fade out
          if (isMatched) {
            if (!enemy.fadeStartTime) {
              return false; // Xóa ngay nếu không có fadeStartTime
            }

            // Kiểm tra xem fade out đã hoàn thành chưa
            if (isFadeOutComplete(enemy)) {
              return false; // Xóa sau khi fade xong
            }
            return true; // Giữ lại để tiếp tục fade
          }

          // Các trường hợp khác: giữ lại kẻ địch trong màn hình và còn sống/targeted
          return inScreen && (isAlive || isTargeted);
        });
      });

      // Lên lịch frame tiếp theo
      animationRef.current = requestAnimationFrame(updateGame);
    },
    [gameState, stopGame, playExplosionSound]
  );

  /**
   * Xử lý khi người chơi nhấn phím
   * Logic:
   * 1. Nếu chưa chọn từ nào: chọn từ dựa trên chữ cái đầu tiên
   * 2. Nếu đã chọn từ: tiếp tục gõ từ đó cho đến khi hoàn thành
   * 3. Khi hoàn thành từ: tiêu diệt quái vật và reset
   */
  const handleKeyInput = useCallback(
    (e) => {
      if (gameState !== GAME_STATES.PLAYING) return;

      const key = e.key.toLowerCase();

      // Chỉ xử lý các chữ cái a-z
      if (!isValidInputKey(key)) return;

      // Nếu chưa chọn từ nào, tìm từ phù hợp dựa trên chữ cái đầu
      if (!selectedEnemyId) {
        const targetEnemy = findTargetEnemyByFirstLetter(enemies, key);
        if (targetEnemy) {
          setSelectedEnemyId(targetEnemy.id);
          setTypedText(key);
          setDisplayStatus(DISPLAY_STATES.TYPING);
        }
        return;
      }

      // Nếu đã chọn từ, tiếp tục gõ
      const selectedEnemy = enemies.find(
        (enemy) => enemy.id === selectedEnemyId
      );
      if (!selectedEnemy || selectedEnemy.state !== ENEMY_STATES.ALIVE) {
        // Từ đã bị xóa hoặc matched, reset và thử chọn từ mới
        setSelectedEnemyId(null);
        setTypedText("");
        setDisplayStatus(DISPLAY_STATES.NONE);
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
                ? { ...enemy, state: ENEMY_STATES.TARGETED }
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
          setDisplayStatus(DISPLAY_STATES.NONE);
        }
      } else {
        // Gõ sai, hiển thị fail và reset selection
        setDisplayStatus(DISPLAY_STATES.FAIL);

        // Reset selection
        setSelectedEnemyId(null);
        setTypedText("");

        // Xóa display status sau 800ms
        setTimeout(() => {
          setDisplayStatus(DISPLAY_STATES.NONE);
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
      if (gameState === GAME_STATES.PLAYING && /^[a-zA-Z]$/.test(e.key)) {
        handleKeyInput(e);
      }

      // Phím Enter: chơi lại khi game over
      if (e.key === "Enter" && gameState === GAME_STATES.GAME_OVER) {
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
    if (gameState === GAME_STATES.PLAYING) {
      lastTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(updateGame);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState]);

  /**
   * Effect: Cập nhật enemiesRef để tránh stale closure
   */
  useEffect(() => {
    enemiesRef.current = enemies;
  }, [enemies]);

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
      handleKeyPress(e);
    };

    // Đăng ký event listener
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup khi component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyPress]);

  /**
   * Component con để render một quái vật:
   * - Vẽ ảnh enemy ngẫu nhiên
   * - Hiển thị từ ở dưới quái vật với highlight nếu được chọn
   * - Hiển thị phần đã gõ bằng màu khác
   * - Áp dụng hiệu ứng khi bị tiêu diệt (mờ đi và to ra)
   */
  const Enemy = ({ enemy }) => {
    // Hiệu ứng visual khi quái vật bị tiêu diệt hoặc đang bị nhắm
    const { opacity, scale } = calculateEnemyFadeEffect(enemy);

    // Kiểm tra xem quái vật này có đang được chọn không
    const isSelected = selectedEnemyId === enemy.id;

    // Tính toán phần đã gõ và phần chưa gõ
    const typedPart = isSelected ? typedText : "";
    const remainingPart = isSelected
      ? enemy.word.slice(typedText.length)
      : enemy.word;

    // Lấy ảnh enemy tương ứng
    const enemyImageLoaded = enemyImagesLoaded[enemy.imageIndex];

    // Kích thước hiển thị enemy (150% của kích thước logic)
    const enemyDisplaySize = GAME_CONFIG.enemySize * 1.5;
    const enemyDisplayOffset = (enemyDisplaySize - GAME_CONFIG.enemySize) / 2;

    return (
      <>
        {/* Thân quái vật - ảnh enemy hoặc fallback circle */}
        {enemyImageLoaded ? (
          <Image
            x={enemy.x - enemyDisplayOffset}
            y={enemy.y - enemyDisplayOffset}
            width={enemyDisplaySize}
            height={enemyDisplaySize}
            image={enemyImageLoaded}
            opacity={opacity}
            scaleX={scale}
            scaleY={scale}
            stroke={isSelected ? "#FFD700" : "transparent"}
            strokeWidth={isSelected ? 3 : 0}
            listening={false}
          />
        ) : (
          // Fallback: hình tròn nếu ảnh chưa load
          <Circle
            x={enemy.x + GAME_CONFIG.enemySize / 2}
            y={enemy.y + GAME_CONFIG.enemySize / 2}
            radius={enemyDisplaySize / 2}
            fill={
              isSelected
                ? GAME_CONFIG.colors.enemySelected
                : GAME_CONFIG.colors.enemy
            }
            stroke={isSelected ? "#FFD700" : "transparent"}
            strokeWidth={isSelected ? 3 : 0}
            opacity={opacity}
            scaleX={scale}
            scaleY={scale}
          />
        )}

        {/* Từ hiển thị dưới quái vật */}
        {isSelected ? (
          // Khi được chọn: hiển thị phần đã gõ (xanh) và phần chưa gõ (xám) liền kề nhau
          <>
            {(() => {
              const { startX, charWidth } = calculateWordDisplayPosition(
                enemy.word,
                enemy.x
              );

              return (
                <>
                  {/* Phần đã gõ - màu xanh lá */}
                  {typedPart && (
                    <Text
                      x={startX}
                      y={enemy.y + enemyDisplaySize + 5}
                      text={typedPart}
                      fontSize={GAME_CONFIG.fontSize}
                      fontFamily="Arial"
                      fill={GAME_CONFIG.colors.enemyTextTyped}
                      align="left"
                      opacity={opacity}
                    />
                  )}
                  {/* Phần chưa gõ - màu xám */}
                  {remainingPart && (
                    <Text
                      x={startX + typedPart.length * charWidth}
                      y={enemy.y + enemyDisplaySize + 5}
                      text={remainingPart}
                      fontSize={GAME_CONFIG.fontSize}
                      fontFamily="Arial"
                      fill={GAME_CONFIG.colors.enemyTextRemaining}
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
            y={enemy.y + enemyDisplaySize + 5}
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

    // Kích thước ảnh turret
    const shipWidth = 80;
    const shipHeight = 60;

    return (
      <>
        {mainShipImageLoaded ? (
          <Image
            x={turretX - shipWidth / 2}
            y={turretY - shipHeight / 2}
            width={shipWidth}
            height={shipHeight}
            image={mainShipImageLoaded}
            listening={false}
          />
        ) : (
          // Fallback nếu ảnh chưa load
          <>
            {/* Đế trụ súng - hình chữ nhật */}
            <Rect
              x={turretX - GAME_CONFIG.turretSize.base / 2}
              y={turretY + 10}
              width={GAME_CONFIG.turretSize.base}
              height={30}
              fill={GAME_CONFIG.colors.turretBase}
              cornerRadius={5}
            />
            {/* Thân súng - hình tròn */}
            <Circle
              x={turretX}
              y={turretY}
              radius={GAME_CONFIG.turretSize.barrel}
              fill={GAME_CONFIG.colors.turret}
              stroke={GAME_CONFIG.colors.turretBarrel}
              strokeWidth={2}
            />
            {/* Nòng súng - hình chữ nhật nhỏ */}
            <Rect
              x={turretX - 3}
              y={turretY - 25}
              width={6}
              height={20}
              fill={GAME_CONFIG.colors.turretBarrel}
              cornerRadius={3}
            />
          </>
        )}
      </>
    );
  };

  /**
   * Component con để render viên đạn với hướng bay
   */
  const Bullet = ({ bullet }) => {
    // Tính góc xoay của đạn dựa trên velocity
    const angle = calculateBulletRotation(bullet);

    return (
      <>
        {/* Thân đạn chính */}
        <Rect
          x={bullet.x}
          y={bullet.y}
          width={GAME_CONFIG.bulletSize.width}
          height={GAME_CONFIG.bulletSize.height}
          fill={GAME_CONFIG.colors.bullet}
          stroke={GAME_CONFIG.colors.bulletStroke}
          strokeWidth={1}
          cornerRadius={3}
          rotation={angle}
          offsetX={GAME_CONFIG.bulletSize.width / 2}
          offsetY={GAME_CONFIG.bulletSize.height / 2}
        />

        {/* Đầu đạn nhọn */}
        <Circle
          x={bullet.x}
          y={bullet.y}
          radius={2}
          fill={GAME_CONFIG.colors.bulletTip}
          offsetX={2}
          offsetY={-6}
          rotation={angle}
        />

        {/* Hiệu ứng trail đạn */}
        <Rect
          x={bullet.x}
          y={bullet.y}
          width={2}
          height={8}
          fill={GAME_CONFIG.colors.bulletTrail}
          opacity={0.6}
          rotation={angle}
          offsetX={1}
          offsetY={-4}
        />
      </>
    );
  };

  return (
    <div className="typing-defense-game">
      <div className="game-header">
        <div className="score-display">Score: {score}</div>
        {/* Hiển thị "Game Over" ở giữa header khi game kết thúc */}
        {gameState === GAME_STATES.GAME_OVER && (
          <div className="game-over-center">Game Over</div>
        )}
        <div className="game-controls">
          {gameState === GAME_STATES.READY && (
            <button className="start-button" onClick={startGame}>
              Bắt đầu trò chơi
            </button>
          )}
          {gameState === GAME_STATES.PLAYING && (
            <button className="stop-button" onClick={stopGame}>
              Dừng
            </button>
          )}
          {gameState === GAME_STATES.GAME_OVER && (
            <button className="restart-button" onClick={startGame}>
              Chơi lại
            </button>
          )}
        </div>
      </div>

      <div className="game-container">
        <Stage width={GAME_CONFIG.width} height={GAME_CONFIG.height}>
          <Layer>
            {/* Background được xử lý bằng CSS */}

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
                  displayStatus === DISPLAY_STATES.SUCCESS
                    ? "#00FF00"
                    : displayStatus === DISPLAY_STATES.FAIL
                    ? "#FF0000"
                    : "#FFFFFF"
                }
                align="center"
                width={200}
                offsetX={100}
              />
            )}
          </Layer>
        </Stage>
      </div>

      {/* Hướng dẫn chơi - thay thế input section */}
      <div className="input-section">
        <div className="input-label">
          {gameState === GAME_STATES.PLAYING
            ? selectedEnemyId
              ? `Đang gõ: ${typedText}`
              : "Nhấn chữ cái đầu tiên của từ để chọn quái vật"
            : "Nhấn bàn phím để bắt đầu gõ"}
        </div>
        {gameState === GAME_STATES.GAME_OVER && (
          <div className="restart-hint">
            Ấn Enter để chơi lại hoặc ESC để thoát
          </div>
        )}
        {gameState === GAME_STATES.PLAYING && (
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
