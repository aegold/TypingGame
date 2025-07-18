import React, { useState, useEffect, useRef } from "react";
import "../styles/LetterTypingGame.css";
import KeyboardManager, { ACTION_TYPES } from "./KeyboardManager";
import useTypingSound from "../hooks/useTypingSound";
import HandGuide from "./HandGuide";

/**
 * LetterTypingGame Component
 * Game để luyện gõ từng chữ cái theo sequences
 * Hiển thị bàn phím ảo và hướng dẫn ngón tay
 */
function LetterTypingGame({
  onFinish, // Callback khi hoàn thành game
  sequences = [["f", " ", "f", " ", "f"]], // Mảng các sequences để luyện
  autoNextLevel = true, // Tự động chuyển sequence tiếp theo
}) {
  // === GAME STATE ===
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState(0); // Index của sequence hiện tại
  const [currentIndex, setCurrentIndex] = useState(0); // Index của ký tự hiện tại trong sequence
  const [isGameActive, setIsGameActive] = useState(true); // Trạng thái game đang active
  const [userProgress, setUserProgress] = useState([]); // Lưu trạng thái từng ký tự đã gõ
  const [isCompleted, setIsCompleted] = useState(false); // Đã hoàn thành sequence hiện tại
  const inputRef = useRef(null); // Reference đến input ẩn để capture keyboard events

  // === TRACKING STATE ===
  const [totalErrors, setTotalErrors] = useState(0); // Tổng số lỗi trong toàn bộ game
  const [startTime, setStartTime] = useState(null); // Thời gian bắt đầu game

  // === EFFECTS ===
  /**
   * Khởi tạo startTime khi game bắt đầu
   */
  useEffect(() => {
    if (isGameActive && !startTime) {
      setStartTime(Date.now());
    }
  }, [isGameActive, startTime]);

  /**
   * Reset errors khi chuyển sequence - Giữ totalErrors để tracking toàn bộ game
   */
  useEffect(() => {
    // Không reset totalErrors khi chuyển sequence để giữ tổng số lỗi
  }, [currentSequenceIndex]);

  // === CURRENT DATA ===
  const currentSequence = sequences[currentSequenceIndex] || sequences[0]; // Sequence đang chơi

  // === HOOKS ===
  const { playSound } = useTypingSound(); // Hook để phát âm thanh khi gõ

  /**
   * Khởi tạo trạng thái ban đầu khi chuyển sequence
   */
  useEffect(() => {
    setUserProgress(
      currentSequence.map(() => ({ status: "pending", input: "" }))
    );
    setCurrentIndex(0);
    setIsCompleted(false);
    setIsGameActive(true);

    // Focus vào input ẩn để capture keyboard events
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentSequenceIndex, sequences]);

  // Focus management
  useEffect(() => {
    if (isGameActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isGameActive]);

  // Reset game cho sequence mới
  const resetGame = () => {
    setUserProgress(
      currentSequence.map(() => ({ status: "pending", input: "" }))
    );
    setCurrentIndex(0);
    setIsCompleted(false);
    setIsGameActive(true);
    setTotalErrors(0);
    setStartTime(Date.now());

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Chuyển sang sequence tiếp theo
  const nextSequence = () => {
    if (currentSequenceIndex < sequences.length - 1) {
      setCurrentSequenceIndex(currentSequenceIndex + 1);
    } else {
      // Hoàn thành tất cả sequences - tính điểm
      const endTime = Date.now();
      const timeSpent = startTime ? (endTime - startTime) / 1000 : 0; // giây
      const totalCharacters = sequences.reduce(
        (total, seq) => total + seq.length,
        0
      );
      const accuracy =
        totalErrors === 0
          ? 100
          : Math.max(
              0,
              ((totalCharacters - totalErrors) / totalCharacters) * 100
            );
      const wpm = timeSpent > 0 ? totalCharacters / 5 / (timeSpent / 60) : 0; // Words per minute
      const score = Math.round(wpm * (accuracy / 100) * 10); // Score formula

      if (onFinish) {
        onFinish({
          completed: true,
          allSequencesCompleted: true,
          totalSequences: sequences.length,
          accuracy: Math.round(accuracy),
          errors: totalErrors,
          wpm: Math.round(wpm),
          timeSpent: Math.round(timeSpent),
          score: score,
          totalCharacters: totalCharacters,
        });
      }
    }
  };

  // Xử lý khi nhấn phím
  const handleKeyPress = (key) => {
    if (!isGameActive || isCompleted) return;

    const expectedChar = currentSequence[currentIndex];
    const inputChar = key === "space" ? " " : key;

    // Cập nhật progress
    const newProgress = [...userProgress];

    if (inputChar === expectedChar) {
      // Đúng
      newProgress[currentIndex] = { status: "correct", input: inputChar };
      setUserProgress(newProgress);

      // Chuyển sang ký tự tiếp theo
      if (currentIndex < currentSequence.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Hoàn thành sequence hiện tại
        setIsCompleted(true);
        setIsGameActive(false);

        setTimeout(() => {
          if (autoNextLevel) {
            // Chuyển sang sequence tiếp theo
            nextSequence();
          } else if (onFinish) {
            // Tính điểm cho sequence đơn lẻ
            const endTime = Date.now();
            const timeSpent = startTime ? (endTime - startTime) / 1000 : 0;
            const accuracy =
              totalErrors === 0
                ? 100
                : Math.max(
                    0,
                    ((currentSequence.length - totalErrors) /
                      currentSequence.length) *
                      100
                  );
            const wpm =
              timeSpent > 0 ? currentSequence.length / 5 / (timeSpent / 60) : 0;
            const score = Math.round(wpm * (accuracy / 100) * 10);

            onFinish({
              completed: true,
              currentSequence,
              sequenceIndex: currentSequenceIndex,
              accuracy: Math.round(accuracy),
              errors: totalErrors,
              wpm: Math.round(wpm),
              timeSpent: Math.round(timeSpent),
              score: score,
              totalCharacters: currentSequence.length,
            });
          }
        }, 500);
      }
    } else {
      // Sai - hiển thị lỗi ngắn rồi reset lập tức
      newProgress[currentIndex] = { status: "incorrect", input: inputChar };
      setUserProgress(newProgress);
      setTotalErrors((prev) => prev + 1); // Tăng số lỗi

      // Reset lập tức sau 200ms để người dùng thấy lỗi rồi có thể bấm lại
      setTimeout(() => {
        const resetProgress = [...userProgress];
        resetProgress[currentIndex] = { status: "pending", input: "" };
        setUserProgress(resetProgress);
      }, 200);
    }
  };

  // Xử lý actions từ KeyboardManager
  const handleKeyboardAction = (action) => {
    if (!isGameActive) return;

    switch (action.type) {
      case ACTION_TYPES.GO_BACK_CHAR:
        // Quay lại ký tự trước đó nếu có thể
        if (currentIndex > 0) {
          const newProgress = [...userProgress];
          newProgress[currentIndex - 1] = { status: "pending", input: "" };
          setUserProgress(newProgress);
          setCurrentIndex(currentIndex - 1);
        }
        break;
      case ACTION_TYPES.ADD_CHAR:
        // Xử lý ký tự mới
        handleKeyPress(action.payload);
        break;
      case ACTION_TYPES.NO_ACTION:
        // Không làm gì
        break;
      default:
        console.warn("Unknown action type:", action.type);
    }

    // Focus lại vào input ẩn
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Xử lý keyboard events
  const handleKeyDown = (e) => {
    if (!isGameActive) return;

    e.preventDefault();

    // Phát sound cho keyboard events
    playSound();

    if (e.key === "Backspace") {
      // Quay lại ký tự trước đó nếu có thể
      if (currentIndex > 0) {
        const newProgress = [...userProgress];
        newProgress[currentIndex - 1] = { status: "pending", input: "" };
        setUserProgress(newProgress);
        setCurrentIndex(currentIndex - 1);
      }
    } else if (e.key === " ") {
      handleKeyPress("space");
    } else if (e.key === "Shift") {
      // Shift key - chỉ cần sound effect (đã phát ở trên)
      return;
    } else if (e.key.length === 1) {
      handleKeyPress(e.key.toLowerCase());
    }
  };

  // Render sequence với trạng thái
  const renderSequence = () => {
    return currentSequence.map((char, index) => {
      const progress = userProgress[index];
      const isCurrent = index === currentIndex && !isCompleted;

      let className = "letter-item";
      if (progress?.status === "correct") className += " correct";
      if (progress?.status === "incorrect") className += " incorrect";
      if (isCurrent) className += " current";

      return (
        <div key={index} className={className}>
          <div className={`letter-display ${char === " " ? "space-key" : ""}`}>
            {char === " " ? "⎵" : char.toUpperCase()}
          </div>
          <div className="letter-input">
            {progress?.status === "correct" && "✓"}
            {progress?.status === "incorrect" && "✗"}
            {isCurrent && <div className="cursor">|</div>}
          </div>
        </div>
      );
    });
  };

  // Lấy ký tự tiếp theo cần gõ
  const getNextKey = () => {
    if (
      !isGameActive ||
      isCompleted ||
      currentIndex >= currentSequence.length
    ) {
      return null;
    }
    return currentSequence[currentIndex];
  };

  // Game state cho KeyboardManager
  const gameState = {
    isGameActive,
    inputValue: "", // LetterTypingGame không có inputValue
  };

  const nextKey = getNextKey();

  return (
    <div className="letter-typing-layout">
      {/* Input ẩn để xử lý keyboard events */}
      <input
        ref={inputRef}
        type="text"
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (isGameActive && inputRef.current) {
            setTimeout(() => inputRef.current.focus(), 10);
          }
        }}
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          opacity: 0,
          pointerEvents: "none",
          width: "1px",
          height: "1px",
        }}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />

      <div className="letter-main-container">
        {/* Sequence display */}
        <div className="sequence-container">
          <div className="sequence-display">{renderSequence()}</div>
        </div>
      </div>

      {/* Bàn phím ảo + 2 bàn tay - cùng 1 hàng */}
      <div className="keyboard-hands-row">
        <HandGuide type="left" nextKey={nextKey} />
        <div className="keyboard-center">
          <KeyboardManager
            gameType="letterTyper"
            gameState={gameState}
            onAction={handleKeyboardAction}
            enableKeyboardEvents={false}
            nextKey={nextKey}
          />
        </div>
        <HandGuide type="right" nextKey={nextKey} />
      </div>
    </div>
  );
}

export default LetterTypingGame;
