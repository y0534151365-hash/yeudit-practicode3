// import React from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import Login from "./login";
// import Register from "./register";
// import Todos from "./Todos"; // הקובץ ששינית

// function App() {
//   return (
//     <Routes>
//       <Route path="/login" element={<Login />} />
//       <Route path="/register" element={<Register />} />
//       <Route path="/tasks" element={<Todos />} />

//       {/* ברירת מחדל — תמיד נכנס ל-login */}
//       <Route path="*" element={<Navigate to="/login" replace />} />
//     </Routes>
//   );
// }

// export default App;


import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./login";
import Register from "./register";
import Todos from "./Todos";
import DebugAuth from "./DebugAuth"; // ✅ הוספנו את זה

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/tasks" element={<Todos />} />
      <Route path="/debug" element={<DebugAuth />} /> {/* ✅ דף בדיקה חדש */}

      {/* ברירת מחדל — תמיד נכנס ל-login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
