import React from "react";
import { getFingerForKey } from "../constants/fingerMapping";
import "../styles/HandGuide.css";

/**
 * HandGuide Component
 *
 * Component hiển thị hướng dẫn tay gõ phím đúng ngón
 *
 * Features:
 * - Hiển thị hình ảnh 2 bàn tay
 * - Highlight ngón tay tương ứng với phím cần nhấn
 * - Hỗ trợ tất cả 10 ngón tay
 * - Responsive layout với 2 layout: compact và full
 *
 * Props:
 * @param {string} nextKey - Phím tiếp theo cần nhấn (để highlight ngón tay)
 * @param {string} type - Loại layout ('compact' hoặc 'full')
 */

// === HAND ASSETS IMPORTS ===
// Import tất cả hình ảnh bàn tay trái
import leftHandBase from "../assets/trai.png";
import leftHandUt from "../assets/trai-ngon_ut.png";
import leftHandApUt from "../assets/trai-ngon_ap_ut.png";
import leftHandGiua from "../assets/trai-ngon_giua.png";
import leftHandTro from "../assets/trai-ngon_tro.png";
import leftHandCai from "../assets/trai-ngon_cai.png";

// Import tất cả hình ảnh bàn tay phải
import rightHandBase from "../assets/phai.png";
import rightHandUt from "../assets/phai-ngon_ut.png";
import rightHandApUt from "../assets/phai-ngon_ap_ut.png";
import rightHandGiua from "../assets/phai-ngon_giua.png";
import rightHandTro from "../assets/phai-ngon_tro.png";
import rightHandCai from "../assets/phai-ngon_cai.png";

function HandGuide({ nextKey, type }) {
  // === FINGER DETECTION ===
  const activeFinger = nextKey ? getFingerForKey(nextKey) : null;

  // === HAND RENDERERS ===
  /**
   * Render bàn tay trái với highlighting
   */
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

  /**
   * Render bàn tay phải với highlighting
   */
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

  // === RENDER LOGIC ===
  // Render một tay duy nhất (cho layout compact)
  if (type === "left") return renderLeftHand();
  if (type === "right") return renderRightHand();

  // Render cả hai tay (layout mặc định)
  return (
    <div className="hand-guide">
      {renderLeftHand()}
      {renderRightHand()}
    </div>
  );
}

export default HandGuide;
