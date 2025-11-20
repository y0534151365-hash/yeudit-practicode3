import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./register.css";

axios.defaults.baseURL = "http://localhost:5211";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("הסיסמאות אינן תואמות!");
      return;
    }

    try {
      const res = await axios.post("/register", {
        username,
        password,
      });

      alert("נרשמת בהצלחה! עכשיו תוכל להתחבר.");
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data || "שגיאה בהרשמה";
      alert(msg);
    }
  };

  return (
    <form onSubmit={handleRegister} className="register-form">
      <h2>הרשמה</h2>

      <input
        type="text"
        placeholder="שם משתמש"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="סיסמה"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="אימות סיסמה"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <button type="submit">הרשם</button>
    </form>
  );
}
