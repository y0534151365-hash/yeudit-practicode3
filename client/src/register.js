// import axios from "axios";
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./register.css";

// axios.defaults.baseURL = process.env.REACT_APP_API_URL;

// export default function Register() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const navigate = useNavigate();

//   const handleRegister = async (e) => {
//     e.preventDefault();

//     if (password !== confirmPassword) {
//       alert("הסיסמאות אינן תואמות!");
//       return;
//     }

//     try {
//       const res = await axios.post("/register", {
//         username,
//         password,
//       });

//       alert("נרשמת בהצלחה! עכשיו תוכל להתחבר.");
//       navigate("/login");
//     } catch (err) {
//       const msg = err.response?.data || "שגיאה בהרשמה";
//       alert(msg);
//     }
//   };

//   return (
//     <form onSubmit={handleRegister} className="register-form">
//       <h2>הרשמה</h2>

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

//       <input
//         type="password"
//         placeholder="אימות סיסמה"
//         value={confirmPassword}
//         onChange={(e) => setConfirmPassword(e.target.value)}
//       />

//       <button type="submit">הרשם</button>
//     </form>
//   );
// }
import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./register.css";

// ✅ הגדרת ה-URL ישירות
const API_URL = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://yeudit-practicode3-lastserver.onrender.com";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("הסיסמאות אינן תואמות!");
      return;
    }

    if (password.length < 6) {
      alert("הסיסמה חייבת להכיל לפחות 6 תווים");
      return;
    }

    setLoading(true);

    try {
      console.log("Registering to:", API_URL); // 🔍 debug
      await axios.post(`${API_URL}/register`, {
        username,
        password,
      });

      alert("נרשמת בהצלחה! עכשיו תוכל להתחבר.");
      navigate("/login");
    } catch (err) {
      console.error("Register error:", err.response || err); // 🔍 debug
      const msg = err.response?.data || "שגיאה בהרשמה";
      alert(typeof msg === "string" ? msg : "שם המשתמש כבר קיים");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleRegister} className="register-form">
        <h2>הרשמה</h2>

        <input
          type="text"
          placeholder="שם משתמש"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={loading}
          minLength={3}
        />

        <input
          type="password"
          placeholder="סיסמה (לפחות 6 תווים)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          minLength={6}
        />

        <input
          type="password"
          placeholder="אימות סיסמה"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
          minLength={6}
        />

        <button type="submit" disabled={loading}>
          {loading ? "רושם..." : "הרשם"}
        </button>
        
        <p>
          כבר יש לך חשבון? <a href="/login">להתחברות</a>
        </p>
      </form>
    </div>
  );
}


