import React from "react";
import VirtualKeyboard from "./VirtualKeyboard";
import useTypingSound from "../hooks/useTypingSound";

/**
 * KeyboardManager Component
 *
 * Component quản lý tương tác bàn phím ảo và xử lý các action cho từng loại game
 *
 * Features:
 * - Tạo action dựa trên game type và key được nhấn
 * - Xử lý logic khác nhau cho từng loại game:
 *   + wordTyper: Gõ từ, submit bằng Enter
 *   + letterTyper: Gõ từng ký tự, không submit
 *   + paragraphTyper: Gõ đoạn văn, không submit
 *   + vietnameseLetterTyper: Gõ ký tự Việt Nam với Telex
 * - Render VirtualKeyboard với highlighting
 * - Phát âm thanh khi nhấn phím
 *
 * Props:
 * @param {string} gameType - Loại game (wordTyper, letterTyper, paragraphTyper, vietnameseLetterTyper)
 * @param {Object} gameState - Trạng thái game hiện tại
 * @param {Function} onAction - Callback khi có action
 * @param {boolean} enableKeyboardEvents - Có bật keyboard events không
 */

// === ACTION TYPES ===
/**
 * Các loại action mà KeyboardManager có thể tạo ra
 */
const ACTION_TYPES = {
  ADD_CHAR: "ADD_CHAR", // Thêm ký tự
  DELETE_CHAR: "DELETE_CHAR", // Xóa ký tự (wordTyper)
  SUBMIT_WORD: "SUBMIT_WORD", // Submit từ (wordTyper)
  RESTART_GAME: "RESTART_GAME", // Restart game
  GO_BACK_CHAR: "GO_BACK_CHAR", // Quay lại ký tự trước (letterTyper)
  NO_ACTION: "NO_ACTION", // Không làm gì
};

// === ACTION CREATOR ===
/**
 * Tạo action dựa trên game type và key được nhấn
 * @param {string} gameType - Loại game
 * @param {string} key - Phím được nhấn
 * @param {Object} gameState - Trạng thái game
 * @returns {Object} Action object với type và payload
 */
const createAction = (gameType, key, gameState) => {
  const { isGameActive, inputValue } = gameState;

  // Không làm gì nếu game không active
  if (!isGameActive) {
    return { type: ACTION_TYPES.NO_ACTION };
  }

  // Bỏ qua shift keys
  if (key === "shift" || key === "rshift") {
    return { type: ACTION_TYPES.NO_ACTION };
  }

  // === LOGIC THEO GAME TYPE ===
  switch (gameType) {
    case "wordTyper":
      // Game gõ từ - có submit và delete
      if (key === "backspace") {
        return { type: ACTION_TYPES.DELETE_CHAR };
      } else if (key === "enter") {
        return {
          type: ACTION_TYPES.SUBMIT_WORD,
          payload: inputValue.trim(),
        };
      } else if (key === " ") {
        return { type: ACTION_TYPES.ADD_CHAR, payload: " " };
      } else if (key.length === 1) {
        return { type: ACTION_TYPES.ADD_CHAR, payload: key };
      }
      break;

    case "letterTyper":
      // Game gõ ký tự - có go back, không có delete/submit
      if (key === "backspace") {
        return { type: ACTION_TYPES.GO_BACK_CHAR };
      } else if (key === "enter") {
        return { type: ACTION_TYPES.NO_ACTION };
      } else if (key === " ") {
        return { type: ACTION_TYPES.ADD_CHAR, payload: " " };
      } else if (key.length === 1) {
        return { type: ACTION_TYPES.ADD_CHAR, payload: key };
      }
      break;

    case "paragraphTyper":
      // Game gõ đoạn văn - có delete, Enter để restart
      if (key === "backspace") {
        return { type: ACTION_TYPES.DELETE_CHAR };
      } else if (key === "enter") {
        return { type: ACTION_TYPES.RESTART_GAME };
      } else if (key === " ") {
        return { type: ACTION_TYPES.ADD_CHAR, payload: " " };
      } else if (key.length === 1) {
        return { type: ACTION_TYPES.ADD_CHAR, payload: key };
      }
      break;

    case "vietnameseLetterTyper":
      // Game học Telex Việt Nam - có delete, không submit
      if (key === "backspace") {
        return { type: ACTION_TYPES.DELETE_CHAR };
      } else if (key === "enter") {
        return { type: ACTION_TYPES.NO_ACTION };
      } else if (key.length === 1) {
        return { type: ACTION_TYPES.ADD_CHAR, payload: key };
      }
      break;

    default:
      return { type: ACTION_TYPES.NO_ACTION };
  }

  return { type: ACTION_TYPES.NO_ACTION };
};

// === MAIN COMPONENT ===
function KeyboardManager({
  gameType,
  gameState,
  onAction,
  enableKeyboardEvents = false,
  nextKey = null, // Key tiếp theo cần highlight (cho letterTyper)
}) {
  // === HOOKS ===
  const { playSound } = useTypingSound();

  // === EVENT HANDLERS ===
  /**
   * Xử lý khi user nhấn phím trên bàn phím ảo
   * @param {string} key - Phím được nhấn
   */
  const handleKeyPress = (key) => {
    // Tạo action dựa trên game type và key
    const action = createAction(gameType, key, gameState);

    // Phát âm thanh cho các action có ý nghĩa
    if (action.type !== ACTION_TYPES.NO_ACTION) {
      playSound();
    }

    // Gọi callback với action được tạo
    onAction(action);
  };

  // === RENDER ===
  return (
    <VirtualKeyboard
      onKeyPress={handleKeyPress}
      activeInput={gameState.inputValue || ""}
      isGameActive={gameState.isGameActive}
      enableKeyboardEvents={enableKeyboardEvents}
      nextKey={nextKey}
    />
  );
}

// === EXPORTS ===
export { ACTION_TYPES };
export default KeyboardManager;
