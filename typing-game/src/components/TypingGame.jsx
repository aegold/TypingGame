import React, { useState, useEffect, useRef } from "react";
import "../styles/TypingGame.css";
import VirtualKeyboard from "./VirtualKeyboard";
import useKeyboardHighlight from "../hooks/useKeyboardHighlight";

// Hàm tính khoảng cách Levenshtein
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
  const [word, setWord] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timer);
  const [isGameActive, setIsGameActive] = useState(false);
  const [correctResults, setCorrectResults] = useState([]);
  const [wrongResults, setWrongResults] = useState([]);
  const [animation, setAnimation] = useState(null);
  const [spellWarning, setSpellWarning] = useState("");
  const inputRef = useRef(null);

  // Ref để lưu callback và stats mới nhất, tránh closure issues
  const onFinishRef = useRef(onFinish);
  const statsRef = useRef({ score: 0, correctResults: [], wrongResults: [] });

  // Cập nhật refs khi props/state thay đổi
  useEffect(() => {
    onFinishRef.current = onFinish;
    statsRef.current = { score, correctResults, wrongResults };
  }, [onFinish, score, correctResults, wrongResults]);

  // Sử dụng custom hook cho keyboard highlight
  const { highlightKey, highlightVirtualKey } =
    useKeyboardHighlight(isGameActive);

  // Chọn một từ ngẫu nhiên từ danh sách words được truyền vào
  const getRandomWord = () => {
    if (words.length === 0) return "hello"; // fallback nếu không có words
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
  };

  // Restart game (đổi tên từ startGame)
  const restartGame = () => {
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

  // Kiểm tra từ đã nhập
  const checkWord = () => {
    if (inputValue.trim().toLowerCase() === word.toLowerCase()) {
      setScore((prevScore) => prevScore + 1);
      setCorrectResults((prevCorrect) => [...prevCorrect, word]);
      setSpellWarning("");
    } else {
      // Kiểm tra gần đúng
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
    setWord(getRandomWord());
    setInputValue("");
  };

  // Xử lý khi người dùng nhấn phím Enter
  const handleKeyPress = (e) => {
    if (e.charCode === 13 && inputValue.trim() !== "" && isGameActive) {
      checkWord();
    }
  };

  // Xử lý thay đổi trong input
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Sửa handleVirtualKeyPress để sử dụng custom hook
  const handleVirtualKeyPress = (key) => {
    if (!isGameActive) return;
    highlightVirtualKey(key);
    if (key === "backspace") {
      setInputValue((prev) => prev.slice(0, -1));
    } else if (key === "enter") {
      if (inputValue.trim() !== "") {
        checkWord();
      }
    } else {
      setInputValue((prev) => prev + key);
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

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
              const { score, correctResults, wrongResults } = statsRef.current;
              onFinishRef.current({
                score,
                correctResults,
                wrongResults,
              });
            }
            return 0;
          }
          if (prevTime <= 10) {
            setAnimation("scaleNumber 2s infinite");
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

  // Đặt focus vào input khi khởi động game
  useEffect(() => {
    if (isGameActive) {
      inputRef.current.focus();
    }
  }, [isGameActive]);

  // Khởi tạo từ đầu tiên và tự động bắt đầu game
  useEffect(() => {
    if (words.length > 0) {
      const firstWord = getRandomWord();
      setWord(firstWord);
      // Tự động bắt đầu game
      setTimeout(() => {
        setIsGameActive(true);
        setScore(0);
        setTimeLeft(timer);
        setCorrectResults([]);
        setWrongResults([]);
        setInputValue("");
        setAnimation(null);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [words, timer]);

  return (
    <div className="typing-game-new-layout">
      <div className={`top-section${noTopMargin ? " no-top-margin" : ""}`}>
        <div className="circle-timer">
          <span className="timer-number">{timeLeft}</span>
        </div>
        <div className="center-content">
          <div className="word-label">Từ cần điền</div>
          <div className="current-word-line">
            {words.length > 0 ? (
              <>
                <span className="current-word">{word}</span>
              </>
            ) : (
              <div>Đang tải...</div>
            )}
          </div>
          <div className="word-values input-center">
            <input
              ref={words.length > 0 ? inputRef : undefined}
              type="text"
              value={words.length > 0 ? inputValue : ""}
              onChange={words.length > 0 ? handleInputChange : undefined}
              onKeyPress={words.length > 0 ? handleKeyPress : undefined}
              placeholder={words.length > 0 ? "Gõ từ này..." : "Đang tải..."}
              className="word-input"
              disabled={words.length === 0}
              style={{
                textAlign: "center",
                fontSize: "1.25rem",
                minWidth: 200,
              }}
            />
          </div>
          {/* Hiển thị nút chơi lại khi game dừng */}
          {!isGameActive && timeLeft > 0 && timeLeft < timer && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 16,
              }}
            >
              <button onClick={restartGame} className="start-button">
                Chơi lại
              </button>
            </div>
          )}

          {/* Hiển thị cảnh báo chính tả */}
          {spellWarning && isGameActive && (
            <div
              style={{
                color: "#ff7eb3",
                marginBottom: 8,
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
        <div className="history-box">
          <div className="history-title">Lịch sử</div>
          <div className="history-counts">
            <div className="history-correct">
              Đúng: <b>{correctResults.length}</b>
            </div>
            <div className="history-wrong">
              Sai: <b>{wrongResults.length}</b>
            </div>
          </div>
        </div>
      </div>
      {/* Bàn phím ảo - hiển thị khi có words */}
      {words.length > 0 && (
        <div className="keyboard-bg-section">
          <div className="keyboard-section">
            <VirtualKeyboard
              onKeyPress={handleVirtualKeyPress}
              activeInput={inputValue}
              isGameActive={isGameActive}
              highlightKey={highlightKey}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default TypingGame;
