import { useEffect } from "react";

const useKeyboardEvents = (isGameActive, onKeyPress) => {
  useEffect(() => {
    if (!isGameActive || !onKeyPress) return;

    const handleKeyDown = (e) => {
      // Chỉ xử lý khi game đang active
      if (!isGameActive) return;

      // Ngăn chặn default behavior
      e.preventDefault();

      // Xử lý các phím đặc biệt
      if (e.key === "Backspace") {
        onKeyPress("backspace");
      } else if (e.key === "Enter") {
        onKeyPress("enter");
      } else if (e.key === " ") {
        onKeyPress("space");
      } else if (e.key === "Shift") {
        onKeyPress("shift");
      } else if (e.key.length === 1) {
        // Chỉ xử lý các ký tự đơn (bao gồm số, chữ cái, dấu câu)
        onKeyPress(e.key.toLowerCase());
      }
    };

    // Thêm event listener
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isGameActive, onKeyPress]);
};

export default useKeyboardEvents;
