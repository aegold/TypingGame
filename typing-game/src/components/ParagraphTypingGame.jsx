import React, { useState, useEffect, useRef } from "react";
import "../styles/TypingGame.css";
import "../styles/ParagraphTypingGame.css";
import VirtualKeyboard from "./VirtualKeyboard";
import useKeyboardHighlight from "../hooks/useKeyboardHighlight";

function ParagraphTypingGame({
  onFinish,
  noTopMargin,
  timer = 60,
  words = [],
}) {
  const [text, setText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timer);
  const [isGameActive, setIsGameActive] = useState(false);
  const [correctChars, setCorrectChars] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState(0);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Ref để lưu callback và stats mới nhất, tránh closure issues
  const onFinishRef = useRef(onFinish);
  const statsRef = useRef({ correctChars: 0, incorrectChars: 0 });

  // Cập nhật refs khi props/state thay đổi
  useEffect(() => {
    onFinishRef.current = onFinish;
    statsRef.current = { correctChars, incorrectChars };
  }, [onFinish, correctChars, incorrectChars]);

  // Sử dụng custom hook cho keyboard highlight
  const { highlightKey, highlightVirtualKey } =
    useKeyboardHighlight(isGameActive);

  // Auto-scroll đến vị trí đang gõ - tối ưu hóa
  useEffect(() => {
    if (currentIndex > 0 && isGameActive && text.length > 100) {
      // Chỉ scroll khi text dài
      // Delay nhỏ để tránh conflict với input events
      const scrollTimeout = setTimeout(() => {
        const currentChar = document.querySelector(".char-current");
        if (currentChar && containerRef.current) {
          const rect = currentChar.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();

          // Chỉ scroll khi ký tự hiện tại thực sự nằm ngoài viewport
          const buffer = 100; // Tăng buffer để tránh scroll quá nhiều
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

  // Xử lý bàn phím ảo
  const handleVirtualKeyPress = (key) => {
    if (!isGameActive) return;

    highlightVirtualKey(key);

    if (key === "backspace") {
      const newValue = userInput.slice(0, -1);
      setUserInput(newValue);
      setCurrentIndex(newValue.length);
      updateStats(newValue);
    } else if (key === "enter") {
      restartGame();
    } else if (key === "space") {
      const newValue = userInput + " ";
      setUserInput(newValue);
      setCurrentIndex(newValue.length);
      updateStats(newValue);
    } else {
      const newValue = userInput + key;
      setUserInput(newValue);
      setCurrentIndex(newValue.length);
      updateStats(newValue);
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

      {/* Bàn phím ảo - hiển thị khi có text */}
      {text && (
        <div className="keyboard-bg-section">
          <div className="keyboard-section">
            <VirtualKeyboard
              onKeyPress={handleVirtualKeyPress}
              activeInput={userInput}
              isGameActive={isGameActive}
              highlightKey={highlightKey}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ParagraphTypingGame;
