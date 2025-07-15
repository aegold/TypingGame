import { useState, useEffect } from "react";

/**
 * useKeyboardHighlight Hook
 *
 * Custom hook để quản lý highlight logic cho bàn phím ảo
 *
 * Features:
 * - Highlight phím khi nhấn physical keyboard
 * - Highlight phím khi click virtual keyboard
 * - Mapping phím từ physical sang virtual keyboard format
 * - Auto clear highlight sau thời gian nhất định
 * - Chỉ hoạt động khi game active
 *
 * @param {boolean} isGameActive - Game có đang active không
 * @returns {Object} { highlightKey, highlightVirtualKey }
 */
const useKeyboardHighlight = (isGameActive) => {
  // === STATE ===
  const [highlightKey, setHighlightKey] = useState(""); // Phím đang được highlight

  // === PHYSICAL KEYBOARD HIGHLIGHT ===
  /**
   * Effect để lắng nghe physical keyboard và highlight tương ứng
   */
  useEffect(() => {
    if (!isGameActive) return;

    /**
     * Xử lý khi nhấn phím vật lý
     * @param {KeyboardEvent} e - Keyboard event
     */
    const handleDown = (e) => {
      let key = e.key.toLowerCase();

      // === KEY MAPPING ===
      // Xử lý mapping cho các phím đặc biệt - đồng bộ với VirtualKeyboard
      const keyMap = {
        " ": " ", // Space key (giữ nguyên space, không map thành "space")
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
        meta: "win", // Windows key
        metaleft: "win",
        metaright: "win",
        contextmenu: "menu",
        fn: "fn",
      };

      // Map key nếu cần
      if (keyMap[key]) {
        key = keyMap[key];
      }

      // === VALID KEYS CHECK ===
      // Danh sách tất cả các phím hợp lệ trong bàn phím 60%
      const validKeys = [
        // Phím chức năng
        "backspace",
        "enter",
        " ", // Space key
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
        // Chữ cái a-z
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
        "t",
        "u",
        "v",
        "w",
        "x",
        "y",
        "z",
        // Số 0-9
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
        // Ký tự đặc biệt
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

      // Chỉ highlight các phím hợp lệ
      if (validKeys.includes(key)) {
        setHighlightKey(key);
      }
    };

    /**
     * Xử lý khi nhả phím - clear highlight
     */
    const handleUp = () => setHighlightKey("");

    // === EVENT LISTENERS ===
    window.addEventListener("keydown", handleDown);
    window.addEventListener("keyup", handleUp);

    // === CLEANUP ===
    return () => {
      window.removeEventListener("keydown", handleDown);
      window.removeEventListener("keyup", handleUp);
    };
  }, [isGameActive]);

  // === VIRTUAL KEYBOARD HIGHLIGHT ===
  /**
   * Hàm để highlight khi nhấn phím ảo
   * @param {string} key - Phím được click trên virtual keyboard
   */
  const highlightVirtualKey = (key) => {
    if (!isGameActive) return;
    setHighlightKey(key);
    // Auto clear sau 150ms
    setTimeout(() => setHighlightKey(""), 150);
  };

  // === RETURN INTERFACE ===
  return {
    highlightKey, // Phím đang được highlight
    highlightVirtualKey, // Hàm highlight cho virtual keyboard
  };
};

export default useKeyboardHighlight;
