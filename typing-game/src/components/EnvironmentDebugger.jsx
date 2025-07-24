import React from "react";

/**
 * EnvironmentDebugger Component
 * Hiển thị thông tin môi trường để debug
 * Chỉ hiển thị trong development mode
 */
const EnvironmentDebugger = () => {
  // Chỉ hiển thị trong development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const envInfo = {
    NODE_ENV: process.env.NODE_ENV,
    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
    REACT_APP_ENV: process.env.REACT_APP_ENV,
    "Current API Base":
      process.env.REACT_APP_API_URL || "http://localhost:5000",
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        fontSize: "12px",
        zIndex: 9999,
        fontFamily: "monospace",
        maxWidth: "300px",
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
        🔧 Environment Debug
      </div>
      {Object.entries(envInfo).map(([key, value]) => (
        <div key={key} style={{ margin: "2px 0" }}>
          <strong>{key}:</strong> {value || "undefined"}
        </div>
      ))}
      <div style={{ marginTop: "8px", fontSize: "10px", color: "#ccc" }}>
        Only visible in development
      </div>
    </div>
  );
};

export default EnvironmentDebugger;
