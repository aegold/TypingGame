import React from "react";

function VirtualKeyboard({
  onKeyPress,
  activeInput,
  isGameActive,
  highlightKey,
}) {
  // Chỉ giữ các hàng chữ cái và thêm số
  const rows = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m"],
  ];

  const specialKeys = [
    { value: "space", display: "Space", width: "160px" },
    { value: "backspace", display: "⌫", width: "100px" },
    { value: "enter", display: "Enter", width: "100px" },
    { value: ",", display: ",", width: "60px" },
    { value: ".", display: ".", width: "60px" },
  ];

  // Hàm xử lý khi nhấn phím
  const handleKeyClick = (key) => {
    if (!isGameActive) return;

    // Xử lý các phím đặc biệt
    if (key === "space") {
      onKeyPress(" ");
    } else if (key === "backspace") {
      onKeyPress("backspace");
    } else if (key === "enter") {
      onKeyPress("enter");
    } else {
      // Xử lý các phím thông thường (bao gồm số và dấu câu)
      onKeyPress(key);
    }
  };

  return (
    <div
      className={`virtual-keyboard ${isGameActive ? "active" : ""}`}
      style={{ width: "100%", maxWidth: 600 }}
    >
      {/* Hiển thị các hàng phím thông thường */}
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="keyboard-row"
          style={{ justifyContent: "center" }}
        >
          {row.map((key) => (
            <button
              key={key}
              className={`keyboard-key${
                highlightKey === key ? " pressed" : ""
              }`}
              onClick={() => handleKeyClick(key)}
              disabled={!isGameActive}
              style={{ minWidth: 36, minHeight: 36, fontSize: "1rem" }}
            >
              {key}
            </button>
          ))}
        </div>
      ))}

      {/* Hiển thị các phím đặc biệt */}
      <div className="keyboard-row" style={{ justifyContent: "center" }}>
        {specialKeys.map((key) => (
          <button
            key={key.value}
            className={`keyboard-key special-key${
              highlightKey === key.value ? " pressed" : ""
            }`}
            onClick={() => handleKeyClick(key.value)}
            style={{ width: key.width, minHeight: 36, fontSize: "0.95rem" }}
            disabled={!isGameActive}
          >
            {key.display}
          </button>
        ))}
      </div>
    </div>
  );
}

export default VirtualKeyboard;
