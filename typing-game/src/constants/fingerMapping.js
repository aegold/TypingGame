/**
 * fingerMapping.js
 *
 * Mapping ngón tay với phím bàn phím cho việc hiển thị hướng dẫn
 *
 * Hệ thống 10 ngón tay chuẩn:
 * - Tay trái: ut (pinky), ap_ut (ring), giua (middle), tro (index), cai (thumb)
 * - Tay phải: tro (index), giua (middle), ap_ut (ring), ut (pinky), cai (thumb)
 *
 * Được sử dụng bởi:
 * - HandGuide component để highlight ngón tay
 * - VirtualKeyboard để color coding
 * - Game components để hiển thị hướng dẫn
 */

// === FINGER TO KEYS MAPPING ===
export const FINGER_MAPPING = {
  // === TAY TRÁI ===
  left_ut: ["1", "q", "a", "z"], // Ngón út trái
  left_ap_ut: ["2", "w", "s", "x"], // Ngón áp út trái
  left_giua: ["3", "e", "d", "c"], // Ngón giữa trái
  left_tro: ["4", "5", "r", "t", "f", "g", "v", "b"], // Ngón trỏ trái
  left_cai: [" ", "shift", "ctrl", "alt", "win"], // Ngón cái trái (space và modifier)

  // === TAY PHẢI ===
  right_tro: ["6", "7", "y", "u", "h", "j", "n", "m"], // Ngón trỏ phải
  right_giua: ["8", "i", "k", ","], // Ngón giữa phải
  right_ap_ut: ["9", "o", "l", "."], // Ngón áp út phải
  right_ut: [
    // Ngón út phải
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
  right_cai: [" ", "rshift", "rctrl", "ralt"], // Ngón cái phải (space và modifier)
};

// === HELPER FUNCTIONS ===
/**
 * Tìm ngón tay tương ứng với phím được nhấn
 * @param {string} key - Phím cần tìm ngón tay
 * @returns {string|null} Tên ngón tay hoặc null nếu không tìm thấy
 */
export const getFingerForKey = (key) => {
  for (const [finger, keys] of Object.entries(FINGER_MAPPING)) {
    if (keys.includes(key?.toLowerCase())) {
      return finger;
    }
  }
  return null; // Không tìm thấy mapping
};
