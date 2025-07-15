import { useEffect } from "react";

/**
 * useKeyboardEvents Hook
 *
 * Custom hook để lắng nghe và xử lý physical keyboard events
 *
 * Features:
 * - Lắng nghe keydown events từ physical keyboard
 * - Chuyển đổi key events thành format chuẩn cho game
 * - Ngăn chặn default browser behaviors
 * - Chỉ hoạt động khi game active
 * - Đồng bộ với VirtualKeyboard key mapping
 *
 * @param {boolean} isGameActive - Game có đang active không
 * @param {Function} onKeyPress - Callback khi có phím được nhấn
 */
const useKeyboardEvents = (isGameActive, onKeyPress) => {
  useEffect(() => {
    // Không hoạt động nếu game không active hoặc không có callback
    if (!isGameActive || !onKeyPress) return;

    /**
     * Xử lý keyboard events
     * @param {KeyboardEvent} e - Keyboard event
     */
    const handleKeyDown = (e) => {
      // Double check game state
      if (!isGameActive) return;

      // Ngăn chặn default browser behaviors
      e.preventDefault();

      // === KEY MAPPING ===
      // Xử lý các phím đặc biệt - đồng bộ với VirtualKeyboard
      if (e.key === "Backspace") {
        onKeyPress("backspace");
      } else if (e.key === "Enter") {
        onKeyPress("enter");
      } else if (e.key === " ") {
        onKeyPress(" ");
      } else if (e.key === "Shift") {
        onKeyPress("shift");
      } else if (e.key === "Tab") {
        onKeyPress("tab");
      } else if (e.key === "CapsLock") {
        onKeyPress("caps");
      } else if (e.key === "Control") {
        onKeyPress("ctrl");
      } else if (e.key === "Alt") {
        onKeyPress("alt");
      } else if (e.key === "Meta") {
        onKeyPress("win");
      } else if (e.key === "ContextMenu") {
        onKeyPress("menu");
      } else if (e.key.length === 1) {
        // Chỉ xử lý các ký tự đơn (số, chữ cái, dấu câu)
        onKeyPress(e.key.toLowerCase());
      }
      // Bỏ qua các phím khác (F1-F12, Arrow keys, etc.)
    };

    // === EVENT LISTENER SETUP ===
    window.addEventListener("keydown", handleKeyDown);

    // === CLEANUP ===
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isGameActive, onKeyPress]);
};

export default useKeyboardEvents;
