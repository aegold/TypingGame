import React, { useState, useEffect, useRef } from "react";
import KeyboardManager, { ACTION_TYPES } from "./KeyboardManager";
import HandGuide from "./HandGuide";
import {
  getTelexSequence,
  getNextKey,
  convertTelex,
} from "../utils/telexConverter";
import useTypingSound from "../hooks/useTypingSound";
import "../styles/VietnameseLetterTypingGame.css";

function VietnameseLetterTypingGame({ lesson, onComplete }) {
  // Game state
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [currentKeyIndex, setCurrentKeyIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [gameStatus, setGameStatus] = useState("playing"); // playing, completed

  // Ref for hidden input
  const hiddenInputRef = useRef(null);

  // Sound effect hook
  const { playSound } = useTypingSound();

  // Helper function to check if input matches expected (IME-aware)
  const isValidInput = (inputKey, expectedKey, targetChar) => {
    // Exact match
    if (inputKey === expectedKey) {
      return { type: "exact", skipTo: null };
    }

    // Check if user typed the final character directly (IME shortcut)
    if (inputKey === targetChar && currentKeyIndex === 0) {
      return { type: "final", skipTo: "complete" };
    }

    // Check partial IME results (e.g., user typed 'â' when expecting 'a' for 'ấ')
    const baseChar = targetChar.normalize("NFD")[0]; // Get base character
    if (inputKey === baseChar && expectedKey === baseChar) {
      return { type: "base", skipTo: null };
    }

    return { type: "invalid", skipTo: null };
  };

  // Helper function to complete current character and move to next
  const completeCurrentCharacter = () => {
    if (currentCharIndex + 1 >= characters.length) {
      // All characters completed
      setGameStatus("completed");
      if (onComplete) {
        // Create result data similar to other games
        const resultData = {
          score: Math.round((characters.length / characters.length) * 100),
          totalCharacters: characters.length,
          completedCharacters: characters.length,
          accuracy: 100, // For now, assume perfect accuracy
          gameType: "vietnameseLetterTyper",
        };
        setTimeout(() => onComplete(resultData), 1000);
      }
    } else {
      // Move to next character
      setCurrentCharIndex((prev) => prev + 1);
      setCurrentKeyIndex(0);
      setUserInput("");
    }
  };

  // Current character and sequence
  const characters = lesson.words || [];
  const targetChar = characters[currentCharIndex];
  const keySequence = targetChar ? getTelexSequence(targetChar) : [];
  const nextKey = getNextKey(targetChar, currentKeyIndex);

  // Focus management
  useEffect(() => {
    if (gameStatus === "playing" && hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  }, [gameStatus]);

  // Handle direct keyboard events
  const handleKeyDown = (e) => {
    if (gameStatus !== "playing") return;

    e.preventDefault();

    // Play sound for direct keyboard events too
    playSound();

    if (e.key === "Backspace") {
      handleAction({ type: ACTION_TYPES.DELETE_CHAR }, true);
    } else if (e.key.length === 1) {
      handleAction(
        {
          type: ACTION_TYPES.ADD_CHAR,
          payload: e.key.toLowerCase(),
        },
        true
      );
    }
  };

  // Handle IME composition events
  const handleCompositionEnd = (e) => {
    if (gameStatus !== "playing") return;

    const composedText = e.data;
    if (composedText && composedText.length === 1) {
      // Play sound for IME input
      playSound();

      handleAction(
        {
          type: ACTION_TYPES.ADD_CHAR,
          payload: composedText.toLowerCase(),
        },
        true
      ); // Skip sound since we already played it
    }
  };

  // Handle key press actions from KeyboardManager
  const handleAction = (action, skipSound = false) => {
    if (gameStatus !== "playing") return;

    switch (action.type) {
      case ACTION_TYPES.ADD_CHAR:
        const key = action.payload.toLowerCase();

        // Play sound for any key press (if not already played)
        if (!skipSound) {
          playSound();
        }

        // Check if this is valid input (IME-aware)
        const validation = isValidInput(key, nextKey, targetChar);

        if (validation.type !== "invalid") {
          // Valid input - update UI and progress
          const newInput = userInput + key;
          setUserInput(newInput);

          // Handle different types of valid input
          if (validation.type === "final") {
            // User typed final character directly (IME shortcut)
            // Complete the entire character sequence
            completeCurrentCharacter();
          } else if (
            validation.type === "exact" ||
            validation.type === "base"
          ) {
            // Normal progression or base character match
            // Check if we've completed the current character
            if (currentKeyIndex + 1 >= keySequence.length) {
              completeCurrentCharacter();
            } else {
              // Move to next key in sequence
              setCurrentKeyIndex((prev) => prev + 1);
            }
          }
        }
        break;

      case ACTION_TYPES.DELETE_CHAR:
        // Play sound for backspace too (if not already played)
        if (!skipSound) {
          playSound();
        }

        if (currentKeyIndex > 0) {
          setCurrentKeyIndex((prev) => prev - 1);
          setUserInput((prev) => prev.slice(0, -1));
        }
        break;

      default:
        break;
    }
  };

  // Get visual state for each key box
  const getKeyState = (index) => {
    if (index < currentKeyIndex) {
      return "completed"; // ✓
    } else if (index === currentKeyIndex) {
      return "current"; // ○
    } else {
      return "pending"; // ░
    }
  };

  // Show completion message
  if (gameStatus === "completed") {
    return (
      <div className="vietnamese-letter-typing-game completed">
        <div className="completion-message">
          <h2>🎉 Hoàn thành!</h2>
          <p>Bạn đã học xong tất cả ký tự!</p>
        </div>
      </div>
    );
  }

  // Show loading if no characters
  if (!targetChar) {
    return (
      <div className="vietnamese-letter-typing-game">
        <div className="loading">Đang tải bài học...</div>
      </div>
    );
  }

  return (
    <div
      className="vietnamese-letter-typing-game"
      onClick={() => hiddenInputRef.current?.focus()}
    >
      {/* Hidden input for keyboard capture */}
      <input
        ref={hiddenInputRef}
        type="text"
        style={{
          position: "absolute",
          left: "-9999px",
          opacity: 0,
          pointerEvents: "none",
        }}
        onKeyDown={handleKeyDown}
        onCompositionEnd={handleCompositionEnd}
        autoFocus
      />

      {/* Target Character */}
      <div className="target-section">
        <div className="target-char">{targetChar}</div>
      </div>

      {/* Key Sequence */}
      <div className="key-sequence">
        {keySequence.map((key, index) => (
          <div key={index} className={`key-box ${getKeyState(index)}`}>
            {key.toUpperCase()}
          </div>
        ))}
      </div>

      {/* Input Box */}
      <div className="input-section">
        <input
          type="text"
          value={userInput}
          readOnly
          className="game-input"
          placeholder="Gõ ở đây..."
          style={{ imeMode: "disabled" }}
        />
      </div>

      {/* Keyboard and Hand Guides */}
      <div className="keyboard-hands-row">
        <HandGuide type="left" nextKey={nextKey} />
        <div className="keyboard-center">
          <KeyboardManager
            gameType="vietnameseLetterTyper"
            gameState={{
              isGameActive: gameStatus === "playing",
              inputValue: userInput,
            }}
            onAction={handleAction}
            enableKeyboardEvents={true}
            nextKey={nextKey}
          />
        </div>
        <HandGuide type="right" nextKey={nextKey} />
      </div>
    </div>
  );
}

export default VietnameseLetterTypingGame;
