import React from "react";
import VirtualKeyboard from "./VirtualKeyboard";
import useTypingSound from "../hooks/useTypingSound";

// Action types cho các game
const ACTION_TYPES = {
  ADD_CHAR: "ADD_CHAR",
  DELETE_CHAR: "DELETE_CHAR",
  SUBMIT_WORD: "SUBMIT_WORD",
  RESTART_GAME: "RESTART_GAME",
  GO_BACK_CHAR: "GO_BACK_CHAR",
  NO_ACTION: "NO_ACTION",
};

// Tạo action dựa trên game type và key
const createAction = (gameType, key, gameState) => {
  const { isGameActive, inputValue } = gameState;

  if (!isGameActive) {
    return { type: ACTION_TYPES.NO_ACTION };
  }

  // Logic chung cho tất cả game
  if (key === "shift" || key === "rshift") {
    return { type: ACTION_TYPES.NO_ACTION };
  }

  // Logic đặc biệt cho từng game type
  switch (gameType) {
    case "wordTyper":
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

    default:
      return { type: ACTION_TYPES.NO_ACTION };
  }

  return { type: ACTION_TYPES.NO_ACTION };
};

function KeyboardManager({
  gameType,
  gameState,
  onAction,
  enableKeyboardEvents = false,
  nextKey = null, // Thêm prop để highlight key tiếp theo
}) {
  const { playSound } = useTypingSound();

  const handleKeyPress = (key) => {
    // Tạo action
    const action = createAction(gameType, key, gameState);

    // Phát sound cho các action có ý nghĩa
    if (action.type !== ACTION_TYPES.NO_ACTION) {
      playSound();
    }

    // Gọi callback với action
    onAction(action);
  };

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

export default KeyboardManager;
export { ACTION_TYPES };
