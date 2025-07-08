// Mapping ngón tay - phím cho toàn bộ ứng dụng
export const FINGER_MAPPING = {
  // Tay trái
  left_ut: ["1", "q", "a", "z"],
  left_ap_ut: ["2", "w", "s", "x"],
  left_giua: ["3", "e", "d", "c"],
  left_tro: ["4", "5", "r", "t", "f", "g", "v", "b"],
  left_cai: [" ", "shift", "ctrl", "alt", "win"], // space và các phím đặc biệt

  // Tay phải
  right_tro: ["6", "7", "y", "u", "h", "j", "n", "m"],
  right_giua: ["8", "i", "k", ","],
  right_ap_ut: ["9", "o", "l", "."],
  right_ut: [
    "0",
    "-",
    "=",
    "p",
    "[",
    "]",
    "\\",
    ";",
    "'",
    "/",
    "backspace",
    "enter",
    "tab",
    "`",
  ],
  right_cai: [" ", "rshift", "rctrl", "ralt"], // space và các phím đặc biệt bên phải
};

// Hàm tìm ngón tay cho phím
export const getFingerForKey = (key) => {
  for (const [finger, keys] of Object.entries(FINGER_MAPPING)) {
    if (keys.includes(key?.toLowerCase())) {
      return finger;
    }
  }
  return null;
};
