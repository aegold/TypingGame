import useKeyboardHighlight from "../hooks/useKeyboardHighlight";
import useKeyboardEvents from "../hooks/useKeyboardEvents";
import { getFingerForKey } from "../constants/fingerMapping";
import "../styles/VirtualKeyboard.css";

/**
 * VirtualKeyboard Component
 *
 * Component bàn phím ảo tương tác được
 *
 * Features:
 * - Layout bàn phím 60% giống thật
 * - Highlighting phím đang nhấn và phím tiếp theo
 * - Color coding theo ngón tay
 * - Hỗ trợ physical keyboard events
 * - Visual feedback khi click
 * - Special keys (Backspace, Enter, Shift, etc.)
 *
 * Props:
 * @param {Function} onKeyPress - Callback khi nhấn phím
 * @param {string} activeInput - Input hiện tại (để hiển thị)
 * @param {boolean} isGameActive - Game có đang active không
 * @param {boolean} enableKeyboardEvents - Có bật physical keyboard không
 * @param {string} nextKey - Phím tiếp theo cần highlight
 */
function VirtualKeyboard({
  onKeyPress,
  activeInput,
  isGameActive,
  enableKeyboardEvents = true,
  nextKey = null, // Phím tiếp theo cần highlight
}) {
  // === HOOKS ===
  const { highlightKey, highlightVirtualKey } =
    useKeyboardHighlight(isGameActive);

  // === KEYBOARD LAYOUT DEFINITION ===
  /**
   * Layout bàn phím 60% theo chuẩn QWERTY
   * Mỗi row chứa các key objects với properties:
   * - key: Giá trị phím
   * - display: Text hiển thị
   * - width: Độ rộng CSS
   * - isSpecial: Có phải special key không
   */
  const keyboardLayout = [
    // Row 1: Numbers và symbols
    [
      { key: "`", display: "`", width: "40px" },
      { key: "1", display: "1", width: "40px" },
      { key: "2", display: "2", width: "40px" },
      { key: "3", display: "3", width: "40px" },
      { key: "4", display: "4", width: "40px" },
      { key: "5", display: "5", width: "40px" },
      { key: "6", display: "6", width: "40px" },
      { key: "7", display: "7", width: "40px" },
      { key: "8", display: "8", width: "40px" },
      { key: "9", display: "9", width: "40px" },
      { key: "0", display: "0", width: "40px" },
      { key: "-", display: "-", width: "40px" },
      { key: "=", display: "=", width: "40px" },
      { key: "backspace", display: "⌫", width: "80px", isSpecial: true },
    ],
    // Row 2: Tab + QWERTY
    [
      { key: "tab", display: "Tab", width: "60px", isSpecial: true },
      { key: "q", display: "Q", width: "40px" },
      { key: "w", display: "W", width: "40px" },
      { key: "e", display: "E", width: "40px" },
      { key: "r", display: "R", width: "40px" },
      { key: "t", display: "T", width: "40px" },
      { key: "y", display: "Y", width: "40px" },
      { key: "u", display: "U", width: "40px" },
      { key: "i", display: "I", width: "40px" },
      { key: "o", display: "O", width: "40px" },
      { key: "p", display: "P", width: "40px" },
      { key: "[", display: "[", width: "40px" },
      { key: "]", display: "]", width: "40px" },
      { key: "\\", display: "\\", width: "60px" },
    ],
    // Row 3: Caps Lock + ASDF
    [
      { key: "caps", display: "Caps", width: "75px", isSpecial: true },
      { key: "a", display: "A", width: "40px" },
      { key: "s", display: "S", width: "40px" },
      { key: "d", display: "D", width: "40px" },
      { key: "f", display: "F", width: "40px" },
      { key: "g", display: "G", width: "40px" },
      { key: "h", display: "H", width: "40px" },
      { key: "j", display: "J", width: "40px" },
      { key: "k", display: "K", width: "40px" },
      { key: "l", display: "L", width: "40px" },
      { key: ";", display: ";", width: "40px" },
      { key: "'", display: "'", width: "40px" },
      { key: "enter", display: "Enter", width: "85px", isSpecial: true },
    ],
    // Row 4: Shift + ZXCV
    [
      { key: "shift", display: "Shift", width: "100px", isSpecial: true },
      { key: "z", display: "Z", width: "40px" },
      { key: "x", display: "X", width: "40px" },
      { key: "c", display: "C", width: "40px" },
      { key: "v", display: "V", width: "40px" },
      { key: "b", display: "B", width: "40px" },
      { key: "n", display: "N", width: "40px" },
      { key: "m", display: "M", width: "40px" },
      { key: ",", display: ",", width: "40px" },
      { key: ".", display: ".", width: "40px" },
      { key: "/", display: "/", width: "40px" },
      { key: "rshift", display: "Shift", width: "115px", isSpecial: true },
    ],
    // Row 5: Bottom row (Ctrl, Win, Alt, Space, etc.)
    [
      { key: "ctrl", display: "Ctrl", width: "62px", isSpecial: true },
      { key: "win", display: "Win", width: "50px", isSpecial: true },
      { key: "alt", display: "Alt", width: "50px", isSpecial: true },
      { key: " ", display: "", width: "250px", isSpecial: true }, // Space key
      { key: "ralt", display: "Alt", width: "50px", isSpecial: true },
      { key: "fn", display: "Fn", width: "50px", isSpecial: true },
      { key: "menu", display: "≡", width: "50px", isSpecial: true },
      { key: "rctrl", display: "Ctrl", width: "62px", isSpecial: true },
    ],
  ];

  // === EVENT HANDLERS ===
  /**
   * Xử lý khi click vào phím trên bàn phím ảo
   * @param {string} key - Phím được click
   */
  const handleKeyClick = (key) => {
    if (!isGameActive) return;

    // Visual feedback
    highlightVirtualKey(key);

    // === KEY PROCESSING ===
    // Xử lý các phím đặc biệt
    if (key === " ") {
      // Space key
      onKeyPress(" ");
    } else if (key === "backspace") {
      onKeyPress("backspace");
    } else if (key === "enter") {
      onKeyPress("enter");
    } else if (key === "shift" || key === "rshift") {
      onKeyPress("shift");
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
      // Các phím chức năng khác - có thể bỏ qua hoặc xử lý riêng
      onKeyPress(key);
    } else {
      // Xử lý các phím thông thường (chữ cái, số, dấu câu)
      onKeyPress(key.toLowerCase());
    }
  };

  // Luôn gọi useKeyboardEvents nhưng chỉ hoạt động khi enableKeyboardEvents = true
  useKeyboardEvents(isGameActive && enableKeyboardEvents, handleKeyClick);

  // Hàm kiểm tra nextKey highlight và trả về finger type
  const getNextKeyInfo = (keyObj, nextKey) => {
    if (!nextKey) return { isNext: false, finger: null };

    let isNext = false;
    // Xử lý đặc biệt cho phím space
    if (nextKey === " " && keyObj.key === "space") {
      isNext = true;
    } else {
      // Xử lý các phím thông thường
      isNext = keyObj.key.toLowerCase() === nextKey.toLowerCase();
    }

    if (isNext) {
      const finger = getFingerForKey(nextKey);
      return { isNext: true, finger };
    }

    return { isNext: false, finger: null };
  };

  return (
    <div className={`virtual-keyboard ${isGameActive ? "active" : ""}`}>
      {/* Hiển thị layout bàn phím 60% */}
      {keyboardLayout.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.map((keyObj) => {
            const nextKeyInfo = getNextKeyInfo(keyObj, nextKey);
            return (
              <button
                key={keyObj.key}
                className={`keyboard-key${
                  keyObj.isSpecial ? " special-key" : ""
                }${highlightKey === keyObj.key ? " pressed" : ""}${
                  nextKeyInfo.isNext
                    ? ` next-key ${nextKeyInfo.finger || ""}`
                    : ""
                }`}
                onClick={() => handleKeyClick(keyObj.key)}
                style={{ minWidth: keyObj.width }}
                disabled={!isGameActive}
              >
                {keyObj.key === "space" ? "Space" : keyObj.display}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default VirtualKeyboard;
