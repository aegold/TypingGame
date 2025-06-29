import React, { useState } from "react";
import axios from "../api/axios";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      await axios.post("/register", { username, password });
      alert("Đăng ký thành công");
    } catch (err) {
      alert("Lỗi đăng ký");
    }
  };

  return (
    <div>
      <h2>Đăng ký</h2>
      <input
        placeholder="Tên đăng nhập"
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Mật khẩu"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleRegister}>Đăng ký</button>
    </div>
  );
}

export default RegisterPage;
