import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("/login", {
        Username: username,
        Password: password,
      });

      localStorage.setItem("token", res.data.token);
      alert("התחברת בהצלחה!");
      navigate("/tasks");
    } catch (err) {
      const msg = err.response?.data || "שגיאה בהתחברות";
      alert(msg);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="text"
        placeholder="שם משתמש"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="סיסמה"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button type="submit">התחבר</button>

      <p>
        אין לך חשבון? <a href="/register">להרשמה</a>
      </p>
    </form>
  );
}


