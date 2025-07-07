import React from "react";
import "../styles/HandGuide.css";

// Import tất cả hình ảnh bàn tay
import leftHandBase from "../assets/trai.png";
import leftHandUt from "../assets/trai-ngon_ut.png";
import leftHandApUt from "../assets/trai-ngon_ap_ut.png";
import leftHandGiua from "../assets/trai-ngon_giua.png";
import leftHandTro from "../assets/trai-ngon_tro.png";
import leftHandCai from "../assets/trai-ngon_cai.png";

import rightHandBase from "../assets/phai.png";
import rightHandUt from "../assets/phai-ngon_ut.png";
import rightHandApUt from "../assets/phai-ngon_ap_ut.png";
import rightHandGiua from "../assets/phai-ngon_giua.png";
import rightHandTro from "../assets/phai-ngon_tro.png";
import rightHandCai from "../assets/phai-ngon_cai.png";

// Mapping ngón tay - phím
const FINGER_MAPPING = {
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
  ],
  right_cai: [" ", "rshift", "rctrl", "ralt"], // space và các phím đặc biệt bên phải
};

// Hàm tìm ngón tay cho phím
const getFingerForKey = (key) => {
  for (const [finger, keys] of Object.entries(FINGER_MAPPING)) {
    if (keys.includes(key?.toLowerCase())) {
      return finger;
    }
  }
  return null;
};

function HandGuide({ nextKey, type }) {
  const activeFinger = nextKey ? getFingerForKey(nextKey) : null;

  // Render từng bàn tay riêng biệt
  const renderLeftHand = () => (
    <div className="hand left-hand">
      <img src={leftHandBase} alt="Left Hand Base" className="hand-base" />
      <img
        src={leftHandUt}
        alt="Left Hand Ut"
        className={`finger-overlay left-ut ${
          activeFinger === "left_ut" ? "active" : ""
        }`}
      />
      <img
        src={leftHandApUt}
        alt="Left Hand Ap Ut"
        className={`finger-overlay left-ap-ut ${
          activeFinger === "left_ap_ut" ? "active" : ""
        }`}
      />
      <img
        src={leftHandGiua}
        alt="Left Hand Giua"
        className={`finger-overlay left-giua ${
          activeFinger === "left_giua" ? "active" : ""
        }`}
      />
      <img
        src={leftHandTro}
        alt="Left Hand Tro"
        className={`finger-overlay left-tro ${
          activeFinger === "left_tro" ? "active" : ""
        }`}
      />
      <img
        src={leftHandCai}
        alt="Left Hand Cai"
        className={`finger-overlay left-cai ${
          activeFinger === "left_cai" ? "active" : ""
        }`}
      />
    </div>
  );

  const renderRightHand = () => (
    <div className="hand right-hand">
      <img src={rightHandBase} alt="Right Hand Base" className="hand-base" />
      <img
        src={rightHandUt}
        alt="Right Hand Ut"
        className={`finger-overlay right-ut ${
          activeFinger === "right_ut" ? "active" : ""
        }`}
      />
      <img
        src={rightHandApUt}
        alt="Right Hand Ap Ut"
        className={`finger-overlay right-ap-ut ${
          activeFinger === "right_ap_ut" ? "active" : ""
        }`}
      />
      <img
        src={rightHandGiua}
        alt="Right Hand Giua"
        className={`finger-overlay right-giua ${
          activeFinger === "right_giua" ? "active" : ""
        }`}
      />
      <img
        src={rightHandTro}
        alt="Right Hand Tro"
        className={`finger-overlay right-tro ${
          activeFinger === "right_tro" ? "active" : ""
        }`}
      />
      <img
        src={rightHandCai}
        alt="Right Hand Cai"
        className={`finger-overlay right-cai ${
          activeFinger === "right_cai" ? "active" : ""
        }`}
      />
    </div>
  );

  if (type === "left") return renderLeftHand();
  if (type === "right") return renderRightHand();
  // Nếu không truyền type, render cả hai (giữ tương thích cũ)
  return (
    <div className="hand-guide">
      {renderLeftHand()}
      {renderRightHand()}
    </div>
  );
}

export default HandGuide;
