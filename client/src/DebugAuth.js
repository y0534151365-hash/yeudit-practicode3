import React, { useState } from 'react';

const API_URL = "https://yeudit-practicode3-lastserver.onrender.com";

export default function DebugAuth() {
  const [username, setUsername] = useState("test123");
  const [password, setPassword] = useState("password123");
  const [logs, setLogs] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const addLog = (message, type = "info") => {
    setLogs(prev => [...prev, { 
      message, 
      type, 
      time: new Date().toLocaleTimeString() 
    }]);
  };

  const testRegister = async () => {
    try {
      addLog(`📝 Registering user: ${username}`, "info");
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      if (res.ok) {
        addLog(`✅ Register success: ${JSON.stringify(data)}`, "success");
      } else {
        addLog(`❌ Register failed: ${JSON.stringify(data)}`, "error");
      }
    } catch (err) {
      addLog(`❌ Register error: ${err.message}`, "error");
    }
  };

  const testLogin = async () => {
    try {
      addLog(`🔐 Logging in: ${username}`, "info");
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        localStorage.setItem("token", data.token);
        addLog(`✅ Login success! Token: ${data.token.substring(0, 20)}...`, "success");
      } else {
        addLog(`❌ Login failed: ${JSON.stringify(data)}`, "error");
      }
    } catch (err) {
      addLog(`❌ Login error: ${err.message}`, "error");
    }
  };

  const testGetTasks = async () => {
    try {
      addLog(`📋 Getting tasks with token...`, "info");
      const res = await fetch(`${API_URL}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      if (res.ok) {
        addLog(`✅ Tasks retrieved: ${JSON.stringify(data)}`, "success");
      } else {
        addLog(`❌ Get tasks failed (${res.status}): ${JSON.stringify(data)}`, "error");
      }
    } catch (err) {
      addLog(`❌ Get tasks error: ${err.message}`, "error");
    }
  };

  const testAddTask = async () => {
    try {
      addLog(`➕ Adding task...`, "info");
      const res = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: "Test Task " + Date.now(),
          isComplete: false
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        addLog(`✅ Task added: ${JSON.stringify(data)}`, "success");
      } else {
        addLog(`❌ Add task failed (${res.status}): ${JSON.stringify(data)}`, "error");
      }
    } catch (err) {
      addLog(`❌ Add task error: ${err.message}`, "error");
    }
  };

  const clearLogs = () => setLogs([]);

  const getLogColor = (type) => {
    switch(type) {
      case "success": return "text-green-700 bg-green-100 border-green-300";
      case "error": return "text-red-700 bg-red-100 border-red-300";
      default: return "text-blue-700 bg-blue-100 border-blue-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8" dir="rtl">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-indigo-600">🔍 בדיקת API</h1>
        
        {/* Input Section */}
        <div className="mb-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">פרטי משתמש</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="שם משתמש"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition"
            />
            <input
              type="password"
              placeholder="סיסמה"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition"
            />
          </div>
          
          {token && (
            <div className="mt-4 p-4 bg-yellow-100 border-2 border-yellow-300 rounded-lg">
              <p className="text-sm font-bold text-yellow-800 mb-1">✅ Token נוכחי:</p>
              <p className="text-xs break-all text-gray-700 font-mono bg-white p-2 rounded">
                {token.substring(0, 60)}...
              </p>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <button
            onClick={testRegister}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-4 rounded-xl font-bold shadow-lg transform hover:scale-105 transition"
          >
            1️⃣ הרשמה
          </button>
          <button
            onClick={testLogin}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-4 rounded-xl font-bold shadow-lg transform hover:scale-105 transition"
          >
            2️⃣ התחברות
          </button>
          <button
            onClick={testGetTasks}
            className={`bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-4 rounded-xl font-bold shadow-lg transform hover:scale-105 transition ${!token && 'opacity-50 cursor-not-allowed'}`}
            disabled={!token}
          >
            3️⃣ קבל משימות
          </button>
          <button
            onClick={testAddTask}
            className={`bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-4 rounded-xl font-bold shadow-lg transform hover:scale-105 transition ${!token && 'opacity-50 cursor-not-allowed'}`}
            disabled={!token}
          >
            4️⃣ הוסף משימה
          </button>
        </div>

        <button
          onClick={clearLogs}
          className="w-full bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-4 py-3 rounded-xl font-bold mb-6 shadow-md"
        >
          🗑️ נקה לוג
        </button>

        {/* Logs */}
        <div className="bg-gray-900 rounded-xl p-6 max-h-96 overflow-y-auto shadow-inner">
          <h2 className="text-white text-2xl font-bold mb-4">📊 Logs</h2>
          {logs.length === 0 ? (
            <p className="text-gray-400 text-center py-12 text-lg">אין לוגים עדיין... לחץ על אחד הכפתורים למעלה</p>
          ) : (
            <div className="space-y-3">
              {logs.map((log, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg border-2 ${getLogColor(log.type)}`}
                >
                  <span className="font-mono text-xs opacity-75 ml-3 bg-white px-2 py-1 rounded">
                    {log.time}
                  </span>
                  <span className="font-semibold">{log.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-indigo-200">
          <h3 className="font-bold text-xl mb-3 text-indigo-700">📝 הוראות שימוש:</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li className="font-medium">לחץ על <strong>"הרשמה"</strong> כדי ליצור משתמש חדש (רק פעם אחת)</li>
            <li className="font-medium">לחץ על <strong>"התחברות"</strong> כדי לקבל Token</li>
            <li className="font-medium">לחץ על <strong>"קבל משימות"</strong> כדי לבדוק אם ה-API עובד</li>
            <li className="font-medium">לחץ על <strong>"הוסף משימה"</strong> כדי ליצור משימה חדשה</li>
          </ol>
          <p className="mt-4 text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-300">
            💡 <strong>טיפ:</strong> אם "הרשמה" נכשלת עם "User already exists", זה בסדר - פשוט תעבור ל"התחברות"
          </p>
        </div>
      </div>
    </div>
  );
}