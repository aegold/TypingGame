import React, { useState, useEffect, useRef } from "react";
import "../styles/TypingGame.css";
import "../styles/ParagraphTypingGame.css";
import KeyboardManager, { ACTION_TYPES } from "./KeyboardManager";
import useTypingSound from "../hooks/useTypingSound";
import HandGuide from "./HandGuide";

/**
 * ParagraphTypingGame Component
 *
 * Component cho game gõ đoạn văn bản (Paragraph Typing Game)
 *
 * Features:
 * - Hiển thị đoạn văn bản để user gõ theo
 * - Real-time character highlighting
 * - Tính WPM (Words Per Minute) và accuracy
 * - Auto-scroll theo vị trí đang gõ
 * - Virtual keyboard highlighting
 * - Hand guide positioning
 * - Timer countdown
 * - Âm thanh gõ phím
 *
 * Props:
 * @param {Function} onFinish - Callback khi game kết thúc
 * @param {boolean} noTopMargin - Loại bỏ margin top
 * @param {number} timer - Thời gian chơi (giây), default 60s
 * @param {Array} words - Danh sách văn bản để chơi
 */
function ParagraphTypingGame({
  onFinish,
  noTopMargin,
  timer = 60,
  words = [],
}) {
  // === STATE MANAGEMENT ===
  const [text, setText] = useState(""); // Văn bản cần gõ
  const [userInput, setUserInput] = useState(""); // Input của user
  const [currentIndex, setCurrentIndex] = useState(0); // Vị trí ký tự hiện tại
  const [timeLeft, setTimeLeft] = useState(timer); // Thời gian còn lại
  const [isGameActive, setIsGameActive] = useState(false); // Game đang active
  const [correctChars, setCorrectChars] = useState(0); // Số ký tự đúng
  const [incorrectChars, setIncorrectChars] = useState(0); // Số ký tự sai
  const inputRef = useRef(null); // Ref cho input field
  const containerRef = useRef(null); // Ref cho text container

  // === HOOKS ===
  const { playSound } = useTypingSound(); // Hook xử lý âm thanh

  // === REFS FOR CALLBACK STABILITY ===
  // Ref để lưu callback và stats mới nhất, tránh closure issues
  const onFinishRef = useRef(onFinish);
  const statsRef = useRef({ correctChars: 0, incorrectChars: 0 });

  // Cập nhật refs khi props/state thay đổi
  useEffect(() => {
    onFinishRef.current = onFinish;
    statsRef.current = { correctChars, incorrectChars };
  }, [onFinish, correctChars, incorrectChars]);

  // === AUTO SCROLL LOGIC ===
  /**
   * Auto-scroll đến vị trí đang gõ - tối ưu hóa performance
   */
  useEffect(() => {
    if (currentIndex > 0 && isGameActive && text.length > 100) {
      // Chỉ scroll khi text dài và game đang active
      const scrollTimeout = setTimeout(() => {
        const currentChar = document.querySelector(".char-current");
        if (currentChar && containerRef.current) {
          const rect = currentChar.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();

          // Chỉ scroll khi ký tự hiện tại thực sự nằm ngoài viewport
          const buffer = 100; // Buffer để tránh scroll quá nhiều
          if (
            rect.top < containerRect.top + buffer ||
            rect.bottom > containerRect.bottom - buffer
          ) {
            currentChar.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            });
          }
        }
      }, 200); // Tăng delay

      return () => clearTimeout(scrollTimeout);
    }
  }, [currentIndex, isGameActive, text.length]);

  // Tạo đoạn văn từ danh sách words và tự động bắt đầu game
  useEffect(() => {
    if (words.length > 0) {
      const paragraph = words.join(" ");
      setText(paragraph);
      // Tự động bắt đầu game khi có text
      setTimeout(() => {
        setIsGameActive(true);
        setTimeLeft(timer);
        setUserInput("");
        setCurrentIndex(0);
        setCorrectChars(0);
        setIncorrectChars(0);
        // Focus vào input ẩn
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [words, timer]);

  // Restart game
  const restartGame = () => {
    setIsGameActive(true);
    setUserInput("");
    setCurrentIndex(0);
    setCorrectChars(0);
    setIncorrectChars(0);
    setTimeLeft(timer);
    // Focus vào input ẩn
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  // Xử lý actions từ KeyboardManager
  const handleKeyboardAction = (action) => {
    if (!isGameActive) return;

    switch (action.type) {
      case ACTION_TYPES.ADD_CHAR:
        const newValue = userInput + action.payload;
        setUserInput(newValue);
        setCurrentIndex(newValue.length);
        updateStats(newValue);
        break;
      case ACTION_TYPES.DELETE_CHAR:
        const newValueAfterDelete = userInput.slice(0, -1);
        setUserInput(newValueAfterDelete);
        setCurrentIndex(newValueAfterDelete.length);
        updateStats(newValueAfterDelete);
        break;
      case ACTION_TYPES.RESTART_GAME:
        restartGame();
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

  // Hàm cập nhật thống kê
  const updateStats = (input) => {
    let correct = 0;
    let incorrect = 0;

    for (let i = 0; i < input.length; i++) {
      if (i < text.length) {
        if (input[i] === text[i]) {
          correct++;
        } else {
          incorrect++;
        }
      }
    }

    setCorrectChars(correct);
    setIncorrectChars(incorrect);
  };

  // Xử lý thay đổi input ẩn
  const handleInputChange = (e) => {
    if (!isGameActive) return;

    const value = e.target.value;
    const oldLength = userInput.length;

    // Phát sound khi có thêm ký tự mới (không phải xóa)
    if (value.length > oldLength) {
      playSound();
    }

    setUserInput(value);
    setCurrentIndex(value.length);
    updateStats(value);
  };

  // Xử lý nhấn phím trên input ẩn
  const handleKeyDown = (e) => {
    if (!isGameActive) return;

    if (e.key === "Enter") {
      e.preventDefault();
      restartGame();
      return;
    }
  };

  // Focus vào input ẩn khi game active
  useEffect(() => {
    if (isGameActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isGameActive]);

  // Đảm bảo focus khi user click vào text area
  const handleContainerClick = () => {
    if (inputRef.current && isGameActive) {
      inputRef.current.focus();
    }
  };

  // Đảm bảo focus khi game hoạt động - tối ưu hóa
  useEffect(() => {
    const handleDocumentClick = (e) => {
      // Chỉ focus nếu click không phải vào input/button
      if (
        isGameActive &&
        inputRef.current &&
        !e.target.matches("input, button, [contenteditable]")
      ) {
        e.preventDefault();
        inputRef.current.focus();
      }
    };

    if (isGameActive) {
      document.addEventListener("click", handleDocumentClick, {
        passive: false,
      });
      return () => document.removeEventListener("click", handleDocumentClick);
    }
  }, [isGameActive]);

  // Đếm ngược thời gian - sử dụng ref để tránh closure issues
  useEffect(() => {
    let interval;
    if (isGameActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setIsGameActive(false);
            // Sử dụng ref để lấy callback và stats mới nhất
            if (onFinishRef.current) {
              const { correctChars, incorrectChars } = statsRef.current;
              onFinishRef.current({
                score: 50,
                correctChars,
                incorrectChars,
                accuracy:
                  correctChars + incorrectChars > 0
                    ? (correctChars / (correctChars + incorrectChars)) * 100
                    : 0,
              });
            }
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isGameActive]); // Chỉ depend vào isGameActive

  // Kiểm tra xem đã đánh hết đoạn văn chưa
  useEffect(() => {
    if (isGameActive && userInput.length === text.length && text.length > 0) {
      setIsGameActive(false);
      if (onFinish) {
        onFinish({
          score: 50, // Mặc định 50 điểm khi hoàn thành đoạn văn
          correctChars,
          incorrectChars,
          accuracy:
            correctChars + incorrectChars > 0
              ? (correctChars / (correctChars + incorrectChars)) * 100
              : 0,
        });
      }
    }
  }, [userInput, text, isGameActive, onFinish, correctChars, incorrectChars]);

  // Render ký tự với màu sắc
  const renderText = () => {
    return text.split("").map((char, index) => {
      let className = "";

      if (index < userInput.length) {
        if (userInput[index] === char) {
          className = "char-correct";
        } else {
          className = "char-incorrect";
        }
      } else if (index === currentIndex) {
        className = "char-current";
      }

      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  // Lấy ký tự tiếp theo cần gõ
  const getNextKey = () => {
    if (!isGameActive || currentIndex >= text.length) {
      return null;
    }
    return text[currentIndex];
  };

  // Game state cho KeyboardManager
  const gameState = {
    isGameActive,
    inputValue: userInput,
  };

  const nextKey = getNextKey();

  return (
    <div className="paragraph-typing-layout">
      {/* Main container kéo dài toàn màn hình */}
      <div className="paragraph-main-container">
        {/* Input ẩn để xử lý keyboard events */}
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            // Tự động focus lại khi bị blur
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

        {/* Text container với timer và stats bên trong */}
        <div className="paragraph-text-section">
          {/* Header với timer và stats - luôn hiển thị khi có text */}
          {text && (
            <div className="paragraph-header-inner">
              <div className="simple-timer">{timeLeft}s</div>
              <div className="error-accuracy-box">
                <div>Errors: {incorrectChars}</div>
                <div>
                  {correctChars + incorrectChars > 0
                    ? Math.round(
                        (correctChars / (correctChars + incorrectChars)) * 100
                      )
                    : 0}
                  % Accuracy
                </div>
              </div>
            </div>
          )}

          {/* Text container - hiển thị khi có text */}
          {text && (
            <div
              className="paragraph-container"
              ref={containerRef}
              onClick={handleContainerClick}
            >
              <div className="paragraph-text">{renderText()}</div>
            </div>
          )}

          {/* Loading state khi chưa có text */}
          {!text && (
            <div className="game-start-section">
              <div>Đang tải...</div>
            </div>
          )}

          {/* Game controls - hiển thị khi có text */}
          {text && (
            <div className="game-controls">
              <button onClick={restartGame} className="restart-button">
                Restart (Enter)
              </button>
              <button
                onClick={() => setIsGameActive(false)}
                className="restart-button"
              >
                Dừng
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bàn phím ảo + 2 bàn tay - layout 25%-50%-25% */}
      {text && (
        <div className="keyboard-hands-row">
          <HandGuide type="left" nextKey={nextKey} />
          <div className="keyboard-center">
            <KeyboardManager
              gameType="paragraphTyper"
              gameState={gameState}
              onAction={handleKeyboardAction}
              enableKeyboardEvents={false}
              nextKey={nextKey}
            />
          </div>
          <HandGuide type="right" nextKey={nextKey} />
        </div>
      )}
    </div>
  );
}

export default ParagraphTypingGame;
