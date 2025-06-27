import { useState, useEffect } from "react";

// Custom hook để quản lý highlight logic cho bàn phím ảo
const useKeyboardHighlight = (isGameActive) => {
  const [highlightKey, setHighlightKey] = useState("");

  // Xử lý highlight khi nhấn phím vật lý
  useEffect(() => {
    if (!isGameActive) return;

    const handleDown = (e) => {
      let key = e.key.toLowerCase();
      if (key === " ") key = "space";

      // Kiểm tra các phím hợp lệ
      if (
        key === "backspace" ||
        key === "enter" ||
        key === "space" ||
        /^[a-z0-9.,]$/.test(key)
      ) {
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

  // Hàm để highlight khi nhấn phím ảo
  const highlightVirtualKey = (key) => {
    if (!isGameActive) return;
    setHighlightKey(key);
    setTimeout(() => setHighlightKey(""), 150);
  };

  return {
    highlightKey,
    highlightVirtualKey,
    setHighlightKey,
  };
};

export default useKeyboardHighlight;
