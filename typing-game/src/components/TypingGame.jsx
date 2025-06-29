import React, { useState, useEffect, useRef } from "react";
import "../styles/TypingGame.css";
import VirtualKeyboard from "./VirtualKeyboard";
import useTypingSound from "../hooks/useTypingSound";

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
  const [highlightKey, setHighlightKey] = useState("");
  const inputRef = useRef(null);

  // Thêm sound hook
  const { playSound } = useTypingSound();

  // Chọn một từ ngẫu nhiên từ danh sách words được truyền vào
  const getRandomWord = () => {
    if (words.length === 0) return "hello"; // fallback nếu không có words
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
  };

  // Khởi động game
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
    const newValue = e.target.value;
    // Phát sound khi người dùng gõ
    if (newValue.length > inputValue.length) {
      playSound();
    }
    setInputValue(newValue);
  };

  // Xử lý nhấn phím vật lý để highlight trên bàn phím ảo
  useEffect(() => {
    if (!isGameActive) return;
    const handleDown = (e) => {
      let key = e.key.toLowerCase();

      // Xử lý mapping cho các phím đặc biệt
      const keyMap = {
        " ": "space",
        shift: "shift",
        shiftleft: "shift",
        shiftright: "rshift",
        tab: "tab",
        capslock: "caps",
        control: "ctrl",
        controlleft: "ctrl",
        controlright: "rctrl",
        alt: "alt",
        altleft: "alt",
        altright: "ralt",
        meta: "win",
        metaleft: "win",
        metaright: "win",
        contextmenu: "menu",
      };

      if (keyMap[key]) {
        key = keyMap[key];
      }

      // Danh sách tất cả các phím hợp lệ
      const validKeys = [
        "backspace",
        "enter",
        "space",
        "shift",
        "rshift",
        "tab",
        "caps",
        "ctrl",
        "rctrl",
        "alt",
        "ralt",
        "win",
        "fn",
        "menu",
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
        "g",
        "h",
        "i",
        "j",
        "k",
        "l",
        "m",
        "n",
        "o",
        "p",
        "q",
        "r",
        "s",
        "t",
        "u",
        "v",
        "w",
        "x",
        "y",
        "z",
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "`",
        "-",
        "=",
        "[",
        "]",
        "\\",
        ";",
        "'",
        ",",
        ".",
        "/",
      ];

      if (validKeys.includes(key)) {
        setHighlightKey(key);
      }
    };
    const handleUp = () => setHighlightKey("");
    window.addEventListener("keydown", handleDown);
    window.addEventListener("keyup", handleUp);
    return () => {
      window.removeEventListener("keydown", handleDown);
      window.removeEventListener("keyup", handleUp);
    };
  }, [isGameActive]);

  // Sửa handleVirtualKeyPress để highlight khi nhấn phím ảo
  const handleVirtualKeyPress = (key) => {
    if (!isGameActive) return;

    setHighlightKey(key);
    setTimeout(() => setHighlightKey(""), 150);

    if (key === "backspace") {
      setInputValue((prev) => prev.slice(0, -1));
      playSound(); // Phát sound cho backspace
    } else if (key === "enter") {
      if (inputValue.trim() !== "") {
        checkWord();
        playSound(); // Phát sound cho enter
      }
    } else if (key === "shift" || key === "rshift") {
      // Không làm gì với phím shift - chỉ highlight
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
      ].includes(key)
    ) {
      // Các phím chức năng khác - không làm gì trong typing game
      return;
    } else if (key === " ") {
      // Xử lý phím space
      setInputValue((prev) => prev + " ");
      playSound(); // Phát sound cho space
    } else {
      // Xử lý các phím thông thường (chữ cái, số, và dấu câu)
      setInputValue((prev) => prev + key);
      playSound(); // Phát sound cho các phím thông thường
    }

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Đếm ngược thời gian
  useEffect(() => {
    let timer;
    if (isGameActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && isGameActive) {
      setIsGameActive(false);
      if (onFinish) {
        onFinish({
          score,
          correctResults,
          wrongResults,
        });
      }
    }
    if (timeLeft <= 10 && timeLeft > 0) {
      setAnimation("scaleNumber 2s infinite");
    }
    return () => clearTimeout(timer);
  }, [timeLeft, isGameActive, onFinish, score, correctResults, wrongResults]);

  // Đặt focus vào input khi khởi động game
  useEffect(() => {
    if (isGameActive) {
      inputRef.current.focus();
    }
  }, [isGameActive]);

  // Khởi tạo từ đầu tiên
  useEffect(() => {
    setWord(getRandomWord());
  }, []);

  const isStopped = !isGameActive && timeLeft > 0 && timeLeft < timer;
  const isNotStarted =
    !isGameActive &&
    timeLeft === timer &&
    correctResults.length === 0 &&
    wrongResults.length === 0;

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

      {/* Bàn phím ảo - luôn hiển thị */}
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
    </div>
  );
}

export default TypingGame;
