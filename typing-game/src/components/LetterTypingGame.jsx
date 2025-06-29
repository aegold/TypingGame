import React, { useState, useEffect, useRef } from "react";
import "../styles/LetterTypingGame.css";
import VirtualKeyboard from "./VirtualKeyboard";
import useTypingSound from "../hooks/useTypingSound";

function LetterTypingGame({
  onFinish,
  sequences = [["f", " ", "f", " ", "f"]], // Mảng các sequences
  autoNextLevel = true, // Tự động chuyển level
}) {
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGameActive, setIsGameActive] = useState(true);
  const [userProgress, setUserProgress] = useState([]); // Lưu trạng thái từng ký tự
  const [isCompleted, setIsCompleted] = useState(false);
  const inputRef = useRef(null);
  // State để theo dõi số lỗi và thời gian
  const [totalErrors, setTotalErrors] = useState(0);
  const [startTime, setStartTime] = useState(null);

  // Khởi tạo startTime khi game bắt đầu
  useEffect(() => {
    if (isGameActive && !startTime) {
      setStartTime(Date.now());
    }
  }, [isGameActive, startTime]);

  // Reset errors khi chuyển sequence
  useEffect(() => {
    // Không reset totalErrors khi chuyển sequence để giữ tổng số lỗi
  }, [currentSequenceIndex]);

  // Lấy sequence hiện tại
  const currentSequence = sequences[currentSequenceIndex] || sequences[0];

  // Sound effect hook
  const { playSound } = useTypingSound();

  // Khởi tạo trạng thái ban đầu
  useEffect(() => {
    setUserProgress(
      currentSequence.map(() => ({ status: "pending", input: "" }))
    );
    setCurrentIndex(0);
    setIsCompleted(false);
    setIsGameActive(true);

    // Focus vào input ẩn
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

  // Xử lý bàn phím ảo
  const handleVirtualKeyPress = (key) => {
    if (!isGameActive) return;

    if (key === "backspace") {
      // Quay lại ký tự trước đó nếu có thể
      if (currentIndex > 0) {
        const newProgress = [...userProgress];
        newProgress[currentIndex - 1] = { status: "pending", input: "" };
        setUserProgress(newProgress);
        setCurrentIndex(currentIndex - 1);
        playSound(); // Phát sound cho backspace
      }
    } else if (key === "shift" || key === "rshift") {
      // Shift key - không làm gì trong letter typing
      return;
    } else if (
      [
        "tab",
        "caps",
        "ctrl",
        "rctrl",
        "alt",
        "ralt",
        "win",
        "fn",
        "menu",
        "enter",
      ].includes(key)
    ) {
      // Các phím chức năng khác - không làm gì trong letter typing
      return;
    } else {
      handleKeyPress(key);
      playSound(); // Phát sound cho các phím thông thường
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
      handleVirtualKeyPress("backspace");
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

      {/* Bàn phím ảo */}
      <div className="keyboard-section">
        <VirtualKeyboard
          onKeyPress={handleVirtualKeyPress}
          activeInput=""
          isGameActive={isGameActive}
          enableKeyboardEvents={false}
        />
      </div>
    </div>
  );
}

export default LetterTypingGame;
