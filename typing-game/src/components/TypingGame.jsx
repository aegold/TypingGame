import React, { useState, useEffect, useRef } from "react";
import "../styles/TypingGame.css";
import KeyboardManager, { ACTION_TYPES } from "./KeyboardManager";
import useTypingSound from "../hooks/useTypingSound";

/**
 * TypingGame Component
 *
 * Component chính cho game gõ từ (Word Typing Game)
 *
 * Features:
 * - Hiển thị từ ngẫu nhiên để user gõ
 * - Tính điểm dựa trên độ chính xác và tốc độ
 * - Timer countdown
 * - Spell checking với Levenshtein distance
 * - Âm thanh gõ phím
 * - Animation feedback
 * - Keyboard highlighting
 *
 * Props:
 * @param {Function} onFinish - Callback khi game kết thúc
 * @param {boolean} noTopMargin - Loại bỏ margin top
 * @param {number} timer - Thời gian chơi (giây)
 * @param {Array} words - Danh sách từ để chơi
 */

// === UTILITY FUNCTIONS ===
/**
 * Tính khoảng cách Levenshtein giữa 2 chuỗi
 * Dùng để đánh giá độ tương tự giữa từ gõ và từ gốc
 * @param {string} a - Chuỗi 1
 * @param {string} b - Chuỗi 2
 * @returns {number} Khoảng cách Levenshtein
 */
function levenshtein(a, b) {
  const matrix = Array(a.length + 1)
    .fill(null)
    .map(() => Array(b.length + 1).fill(null));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i][j - 1] + 1, // thêm
        matrix[i - 1][j] + 1, // xóa
        matrix[i - 1][j - 1] + indicator // thay thế
      );
    }
  }
  return matrix[a.length][b.length];
}

function TypingGame({ onFinish, noTopMargin, timer = 30, words = [] }) {
  // === STATE MANAGEMENT ===
  const [word, setWord] = useState(""); // Từ hiện tại cần gõ
  const [inputValue, setInputValue] = useState(""); // Giá trị input
  const [score, setScore] = useState(0); // Điểm số
  const [timeLeft, setTimeLeft] = useState(timer); // Thời gian còn lại
  const [isGameActive, setIsGameActive] = useState(false); // Game đang active
  const [correctResults, setCorrectResults] = useState([]); // Từ gõ đúng
  const [wrongResults, setWrongResults] = useState([]); // Từ gõ sai
  const [animation, setAnimation] = useState(null); // Animation hiện tại
  const [spellWarning, setSpellWarning] = useState(""); // Cảnh báo chính tả
  const inputRef = useRef(null); // Ref cho input field

  // === HOOKS ===
  const { playSound } = useTypingSound(); // Hook xử lý âm thanh

  // === GAME LOGIC ===
  /**
   * Chọn từ ngẫu nhiên từ danh sách
   */
  const getRandomWord = () => {
    if (words.length === 0) return "hello"; // fallback nếu không có words
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
  };

  /**
   * Bắt đầu game
   */
  const startGame = () => {
    setIsGameActive(true);
    setScore(0);
    setTimeLeft(timer);
    setCorrectResults([]);
    setWrongResults([]);
    setWord(getRandomWord());
    setInputValue("");
    setAnimation(null);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  /**
   * Kiểm tra từ đã nhập
   * So sánh với từ gốc và tính điểm
   */
  const checkWord = () => {
    if (inputValue.trim().toLowerCase() === word.toLowerCase()) {
      // Từ đúng hoàn toàn
      setScore((prevScore) => prevScore + 1);
      setCorrectResults((prevCorrect) => [...prevCorrect, word]);
      setSpellWarning("");
    } else {
      // Kiểm tra gần đúng với Levenshtein distance
      const dist = levenshtein(
        inputValue.trim().toLowerCase(),
        word.toLowerCase()
      );
      if (dist > 0 && dist <= 2) {
        setSpellWarning(`Bạn gần đúng! Kiểm tra lại chính tả: "${inputValue}"`);
      } else {
        setSpellWarning("");
      }
      setWrongResults((prevWrong) => [...prevWrong, word]);
    }
    // Chuyển sang từ tiếp theo
    setWord(getRandomWord());
    setInputValue("");
  };

  /**
   * Xử lý Enter key press
   */
  const handleKeyPress = (e) => {
    if (e.charCode === 13 && inputValue.trim() !== "" && isGameActive) {
      checkWord();
    }
  };

  /**
   * Xử lý thay đổi trong input
   * Phát âm thanh khi user gõ
   */
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    // Phát sound khi người dùng gõ thêm ký tự
    if (newValue.length > inputValue.length) {
      playSound();
    }
    setInputValue(newValue);
  };

  /**
   * Xử lý actions từ KeyboardManager (Virtual Keyboard)
   * @param {Object} action - Action object với type và payload
   */
  const handleKeyboardAction = (action) => {
    switch (action.type) {
      case ACTION_TYPES.ADD_CHAR:
        setInputValue((prev) => prev + action.payload);
        break;
      case ACTION_TYPES.DELETE_CHAR:
        setInputValue((prev) => prev.slice(0, -1));
        break;
      case ACTION_TYPES.SUBMIT_WORD:
        if (action.payload !== "") {
          checkWord();
        }
        break;
      case ACTION_TYPES.NO_ACTION:
        // Không làm gì
        break;
      default:
        console.warn("Unknown action type:", action.type);
    }

    // Focus vào input sau khi thao tác
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // === EFFECTS ===
  /**
   * Timer countdown effect
   */
  useEffect(() => {
    let timer;
    if (isGameActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && isGameActive) {
      // Game kết thúc
      setIsGameActive(false);
      if (onFinish) {
        onFinish({
          score,
          correctResults,
          wrongResults,
        });
      }
    }
    // Animation cho countdown cuối
    if (timeLeft <= 10 && timeLeft > 0) {
      setAnimation("scaleNumber 2s infinite");
    }
    return () => clearTimeout(timer);
  }, [timeLeft, isGameActive, onFinish, score, correctResults, wrongResults]);

  /**
   * Auto focus input khi game active
   */
  useEffect(() => {
    if (isGameActive) {
      inputRef.current.focus();
    }
  }, [isGameActive]);

  /**
   * Khởi tạo từ đầu tiên khi component mount
   */
  useEffect(() => {
    setWord(getRandomWord());
  }, []);

  // === GAME STATE HELPERS ===
  const isStopped = !isGameActive && timeLeft > 0 && timeLeft < timer;
  const isNotStarted =
    !isGameActive &&
    timeLeft === timer &&
    correctResults.length === 0 &&
    wrongResults.length === 0;

  // Game state cho KeyboardManager
  const gameState = {
    isGameActive,
    inputValue,
  };

  // === RENDER ===
  return (
    <div className="typing-game-new-layout">
      {/* Main container kéo dài toàn màn hình */}
      <div className="typing-main-container">
        {/* Game content section với layout 3 cột */}
        <div className="typing-game-section">
          <div className="typing-content-container">
            {/* Layout 3 cột: timer - content - stats */}
            <div className="typing-three-column-layout">
              {/* Timer bên trái */}
              <div className="timer-section">
                <div className="large-timer">{timeLeft}s</div>
              </div>

              {/* Game content ở giữa */}
              <div className="game-content-center">
                <div className="word-label">Từ cần điền</div>
                <div className="current-word-line">
                  {isGameActive ? (
                    <span className="current-word">{word}</span>
                  ) : (
                    <span className="current-word-placeholder">
                      Nhấn bắt đầu
                    </span>
                  )}
                </div>
                <div className="word-values input-center">
                  <input
                    ref={isGameActive ? inputRef : undefined}
                    type="text"
                    value={isGameActive ? inputValue : ""}
                    onChange={isGameActive ? handleInputChange : undefined}
                    onKeyPress={isGameActive ? handleKeyPress : undefined}
                    placeholder={
                      isGameActive ? "Gõ từ này..." : "Nhấn nút để bắt đầu..."
                    }
                    className="word-input"
                    disabled={!isGameActive}
                    style={{
                      textAlign: "center",
                      fontSize: "1.25rem",
                      minWidth: 200,
                    }}
                  />
                </div>

                {/* Buttons */}
                {isStopped && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginTop: 16,
                    }}
                  >
                    <button onClick={startGame} className="start-button">
                      Chơi lại
                    </button>
                  </div>
                )}
                {isNotStarted && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginTop: 16,
                    }}
                  >
                    <button onClick={startGame} className="start-button">
                      Bắt đầu
                    </button>
                  </div>
                )}

                {/* Hiển thị cảnh báo chính tả */}
                {spellWarning && isGameActive && (
                  <div
                    style={{
                      color: "#ff7eb3",
                      marginTop: 8,
                      fontWeight: "bold",
                      fontSize: "1rem",
                      textAlign: "center",
                    }}
                  >
                    {spellWarning}
                  </div>
                )}

                {/* Nút dừng game */}
                {isGameActive && (
                  <button
                    onClick={() => setIsGameActive(false)}
                    className="restart-button"
                    style={{ marginTop: 16 }}
                  >
                    Dừng
                  </button>
                )}
              </div>

              {/* Stats bên phải */}
              <div className="stats-section">
                <div className="typing-stats-box">
                  <div className="stats-title">Thống kê</div>
                  <div>Đúng: {correctResults.length}</div>
                  <div>Sai: {wrongResults.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bàn phím ảo - sử dụng KeyboardManager */}
      <div className="keyboard-bg-section">
        <div className="typing-keyboard-section">
          <KeyboardManager
            gameType="wordTyper"
            gameState={gameState}
            onAction={handleKeyboardAction}
            enableKeyboardEvents={false}
          />
        </div>
      </div>
    </div>
  );
}

export default TypingGame;
