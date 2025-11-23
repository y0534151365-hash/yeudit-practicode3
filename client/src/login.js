// import axios from "axios";
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./login.css";

// axios.defaults.baseURL = process.env.REACT_APP_API_URL;

// export default function Login() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.post("/login", { username, password });
//       localStorage.setItem("token", res.data.token);
//       alert("התחברת בהצלחה!");
//       navigate("/tasks");
//     } catch (err) {
//       const msg = err.response?.data || "שגיאה בהתחברות";
//       alert(msg);
//     }
//   };

//   return (
//     <form onSubmit={handleLogin}>
//       <input
//         type="text"
//         placeholder="שם משתמש"
//         value={username}
//         onChange={(e) => setUsername(e.target.value)}
//       />
//       <input
//         type="password"
//         placeholder="סיסמה"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//       />
//       <button type="submit">התחבר</button>
//       <p>
//         אין לך חשבון? <a href="/register">להרשמה</a>
//       </p>
//     </form>
//   );
// }

import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

// ✅ הגדרת ה-URL ישירות
const API_URL = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://yeudit-practicode3-lastserver.onrender.com";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Logging in to:", API_URL); // 🔍 debug
      const res = await axios.post(`${API_URL}/login`, { 
        username, 
        password 
      });
      
      localStorage.setItem("token", res.data.token);
      alert("התחברת בהצלחה!");
      navigate("/tasks");
    } catch (err) {
      console.error("Login error:", err.response || err); // 🔍 debug
      const msg = err.response?.data || "שגיאה בהתחברות";
      alert(typeof msg === "string" ? msg : "שם משתמש או סיסמה שגויים");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2>התחברות</h2>
        
        <input
          type="text"
          placeholder="שם משתמש"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={loading}
        />
        
        <input
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        
        <button type="submit" disabled={loading}>
          {loading ? "מתחבר..." : "התחבר"}
        </button>
        
        <p>
          אין לך חשבון? <a href="/register">להרשמה</a>
        </p>
      </form>
    </div>
  );
}


