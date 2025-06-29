import React from "react";
import LetterTypingGame from "../components/LetterTypingGame";

function LetterGameDemo() {
  const handleFinish = (result) => {
    console.log("Game finished:", result);
    alert(`Hoàn thành! Accuracy: ${result.accuracy}%`);
  };

  const sequences = {
    basic: ["f", " ", "f", " ", "f"],
    intermediate: ["a", "s", "d", " ", "f", " ", "j", "k", "l"],
    advanced: ["q", "w", "e", "r", " ", "t", "y", " ", "u", "i", "o", "p"],
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Letter Typing Game Demo</h1>

      <div style={{ marginBottom: "2rem" }}>
        <h3>Cấp độ cơ bản:</h3>
        <LetterTypingGame
          sequence={sequences.basic}
          onFinish={handleFinish}
          autoNextLevel={false}
        />
      </div>

      <hr style={{ margin: "2rem 0" }} />

      <div style={{ marginBottom: "2rem" }}>
        <h3>Cấp độ trung bình:</h3>
        <LetterTypingGame
          sequence={sequences.intermediate}
          onFinish={handleFinish}
          autoNextLevel={false}
        />
      </div>
    </div>
  );
}

export default LetterGameDemo;
