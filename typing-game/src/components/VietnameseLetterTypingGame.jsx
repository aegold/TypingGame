import React, { useState, useEffect, useRef } from "react";
import KeyboardManager, { ACTION_TYPES } from "./KeyboardManager";
import HandGuide from "./HandGuide";
import { getTelexSequence, getNextKey } from "../utils/telexConverter";
import useTypingSound from "../hooks/useTypingSound";
import "../styles/VietnameseLetterTypingGame.css";

/**
 * VietnameseLetterTypingGame Component
 * Game để học gõ ký tự tiếng Việt có dấu bằng phương pháp Telex
 * Hướng dẫn user gõ từng phím để tạo ra ký tự có dấu
 */
function VietnameseLetterTypingGame({ lesson, onComplete }) {
  // === GAME STATE ===
  const [currentCharIndex, setCurrentCharIndex] = useState(0); // Index của ký tự đang học
  const [currentKeyIndex, setCurrentKeyIndex] = useState(0); // Index của phím trong sequence Telex
  const [userInput, setUserInput] = useState(""); // Input hiện tại của user
  const [gameStatus, setGameStatus] = useState("playing"); // Trạng thái game: playing, completed

  // === REFS ===
  const hiddenInputRef = useRef(null); // Input ẩn để capture keyboard events

  // === HOOKS ===
  const { playSound } = useTypingSound(); // Hook phát âm thanh khi gõ

  // === HELPER FUNCTIONS ===
  /**
   * Kiểm tra input có khớp với key mong đợi không (hỗ trợ IME)
   * @param {string} inputKey - Phím user nhấn
   * @param {string} expectedKey - Phím mong đợi
   * @param {string} targetChar - Ký tự đích
   * @returns {Object} Kết quả validation với type và skipTo
   */
  const isValidInput = (inputKey, expectedKey, targetChar) => {
    // Khớp chính xác
    if (inputKey === expectedKey) {
      return { type: "exact", skipTo: null };
    }

    // Kiểm tra nếu user gõ ký tự cuối trực tiếp (IME shortcut)
    if (inputKey === targetChar && currentKeyIndex === 0) {
      return { type: "final", skipTo: "complete" };
    }

    // Kiểm tra kết quả IME một phần (vd: user gõ 'â' khi mong đợi 'a' cho 'ấ')
    const baseChar = targetChar.normalize("NFD")[0]; // Lấy ký tự gốc
    if (inputKey === baseChar && expectedKey === baseChar) {
      return { type: "base", skipTo: null };
    }

    return { type: "invalid", skipTo: null };
  };

  /**
   * Hoàn thành ký tự hiện tại và chuyển sang ký tự tiếp theo
   */
  const completeCurrentCharacter = () => {
    if (currentCharIndex + 1 >= characters.length) {
      // Đã hoàn thành tất cả ký tự
      setGameStatus("completed");
      if (onComplete) {
        // Tạo dữ liệu kết quả tương tự các game khác
        const resultData = {
          score: Math.round((characters.length / characters.length) * 100),
          totalCharacters: characters.length,
          completedCharacters: characters.length,
          accuracy: 100, // Tạm thời giả định độ chính xác hoàn hảo
          gameType: "vietnameseLetterTyper",
        };
        setTimeout(() => onComplete(resultData), 1000);
      }
    } else {
      // Chuyển sang ký tự tiếp theo
      setCurrentCharIndex((prev) => prev + 1);
      setCurrentKeyIndex(0);
      setUserInput("");
    }
  };

  // === GAME DATA ===
  // Ký tự hiện tại và sequence
  const characters = lesson.words || [];
  const targetChar = characters[currentCharIndex];
  const keySequence = targetChar ? getTelexSequence(targetChar) : [];
  const nextKey = getNextKey(targetChar, currentKeyIndex);

  // === EFFECTS ===
  /**
   * Quản lý focus cho input ẩn
   */
  useEffect(() => {
    if (gameStatus === "playing" && hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  }, [gameStatus]);

  // === EVENT HANDLERS ===
  /**
   * Xử lý keyboard events trực tiếp
   */
  const handleKeyDown = (e) => {
    if (gameStatus !== "playing") return;

    e.preventDefault();

    // Phát âm thanh cho keyboard events trực tiếp
    playSound();

    if (e.key === "Backspace") {
      handleAction({ type: ACTION_TYPES.DELETE_CHAR }, true);
    } else if (e.key.length === 1) {
      handleAction(
        {
          type: ACTION_TYPES.ADD_CHAR,
          payload: e.key.toLowerCase(),
        },
        true
      );
    }
  };

  /**
   * Xử lý IME composition events
   */
  const handleCompositionEnd = (e) => {
    if (gameStatus !== "playing") return;

    const composedText = e.data;
    if (composedText && composedText.length === 1) {
      // Phát âm thanh cho IME input
      playSound();

      handleAction(
        {
          type: ACTION_TYPES.ADD_CHAR,
          payload: composedText.toLowerCase(),
        },
        true
      ); // Bỏ qua sound vì đã phát rồi
    }
  };

  /**
   * Xử lý actions từ KeyboardManager
   * @param {Object} action - Action object
   * @param {boolean} skipSound - Có bỏ qua âm thanh không
   */
  const handleAction = (action, skipSound = false) => {
    if (gameStatus !== "playing") return;

    switch (action.type) {
      case ACTION_TYPES.ADD_CHAR:
        const key = action.payload.toLowerCase();

        // Phát âm thanh cho bất kỳ phím nào (nếu chưa phát)
        if (!skipSound) {
          playSound();
        }

        // Kiểm tra input có hợp lệ không (hỗ trợ IME)
        const validation = isValidInput(key, nextKey, targetChar);

        if (validation.type !== "invalid") {
          // Input hợp lệ - cập nhật UI và tiến trình
          const newInput = userInput + key;
          setUserInput(newInput);

          // Xử lý các loại input hợp lệ khác nhau
          if (validation.type === "final") {
            // User gõ ký tự cuối trực tiếp (IME shortcut)
            // Hoàn thành toàn bộ sequence ký tự
            completeCurrentCharacter();
          } else if (
            validation.type === "exact" ||
            validation.type === "base"
          ) {
            // Tiến trình bình thường hoặc khớp ký tự gốc
            // Kiểm tra đã hoàn thành ký tự hiện tại chưa
            if (currentKeyIndex + 1 >= keySequence.length) {
              completeCurrentCharacter();
            } else {
              // Chuyển sang phím tiếp theo trong sequence
              setCurrentKeyIndex((prev) => prev + 1);
            }
          }
        }
        break;

      case ACTION_TYPES.DELETE_CHAR:
        // Phát âm thanh cho backspace (nếu chưa phát)
        if (!skipSound) {
          playSound();
        }

        if (currentKeyIndex > 0) {
          setCurrentKeyIndex((prev) => prev - 1);
          setUserInput((prev) => prev.slice(0, -1));
        }
        break;

      default:
        break;
    }
  };

  // === UI HELPER FUNCTIONS ===
  /**
   * Lấy trạng thái visual cho mỗi key box
   * @param {number} index - Index của key trong sequence
   * @returns {string} CSS class cho trạng thái
   */
  const getKeyState = (index) => {
    if (index < currentKeyIndex) {
      return "completed"; // ✓ - Đã hoàn thành
    } else if (index === currentKeyIndex) {
      return "current"; // ○ - Đang thực hiện
    } else {
      return "pending"; // ░ - Chờ thực hiện
    }
  };

  // === RENDER CONDITIONS ===
  // Hiển thị thông báo hoàn thành
  if (gameStatus === "completed") {
    return (
      <div className="vietnamese-letter-typing-game completed">
        <div className="completion-message">
          <h2>Hoàn thành!</h2>
          <p>Bạn đã học xong tất cả ký tự!</p>
        </div>
      </div>
    );
  }

  // Hiển thị loading nếu không có ký tự
  if (!targetChar) {
    return (
      <div className="vietnamese-letter-typing-game">
        <div className="loading">Đang tải bài học...</div>
      </div>
    );
  }

  // === MAIN RENDER ===
  return (
    <div
      className="vietnamese-letter-typing-game"
      onClick={() => hiddenInputRef.current?.focus()}
    >
      {/* Input ẩn để capture keyboard */}
      <input
        ref={hiddenInputRef}
        type="text"
        style={{
          position: "absolute",
          left: "-9999px",
          opacity: 0,
          pointerEvents: "none",
        }}
        onKeyDown={handleKeyDown}
        onCompositionEnd={handleCompositionEnd}
        autoFocus
      />

      {/* Ký tự mục tiêu */}
      <div className="target-section">
        <div className="target-char">{targetChar}</div>
      </div>

      {/* Sequence phím */}
      <div className="key-sequence">
        {keySequence.map((key, index) => (
          <div key={index} className={`key-box ${getKeyState(index)}`}>
            {key.toUpperCase()}
          </div>
        ))}
      </div>

      {/* Bàn phím và hướng dẫn tay */}
      <div className="keyboard-hands-row">
        <HandGuide type="left" nextKey={nextKey} />
        <div className="keyboard-center">
          <KeyboardManager
            gameType="vietnameseLetterTyper"
            gameState={{
              isGameActive: gameStatus === "playing",
              inputValue: userInput,
            }}
            onAction={handleAction}
            enableKeyboardEvents={true}
            nextKey={nextKey}
          />
        </div>
        <HandGuide type="right" nextKey={nextKey} />
      </div>
    </div>
  );
}

export default VietnameseLetterTypingGame;
