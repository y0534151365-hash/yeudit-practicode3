import axios from "axios";

// בסיס הכתובת של ה־API
axios.defaults.baseURL = "http://localhost:5211";

// מוסיפים את ה־token לכל בקשה אוטומטית
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// במקרה של שגיאה — אם זה 401 (לא מורשה) נעבור לדף login
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Session expired or unauthorized. Redirecting to login...");
      window.location = "/login";
    } else {
      console.error("Error in API call:", error);
    }
    return Promise.reject(error);
  }
);

// פונקציות גישה ל־API
export const getTasks = async () => {
  const result = await axios.get("/tasks");
  return result.data;
};

// export const addTask = async (task) => {
//   const result = await axios.post("/tasks", task);
//   return result.data;
// };
export const addTask = async (task) => {
  const result = await axios.post("/tasks", task, {
    headers: {
      "Content-Type": "application/json"
    }
  });
  return result.data;
};

export const updateTask = async (id, task) => {
  const result = await axios.put(`/tasks/${id}`, task);
  return result.data;
};

export const deleteTask = async (id) => {
  const result = await axios.delete(`/tasks/${id}`);
  return result.data;
};

export default {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
};

