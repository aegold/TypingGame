import { useState, useEffect } from "react";

// Custom hook để quản lý highlight logic cho bàn phím ảo
const useKeyboardHighlight = (isGameActive) => {
  const [highlightKey, setHighlightKey] = useState("");

  // Xử lý highlight khi nhấn phím vật lý
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

      // Danh sách tất cả các phím hợp lệ trong bàn phím 60%
      const validKeys = [
        // Phím chức năng
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
        // Chữ cái
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
        // Số
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
