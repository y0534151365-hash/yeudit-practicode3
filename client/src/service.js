import axios from "axios";


const API_URL = "https://yeudit-practicode3-lastserver.onrender.com";

axios.defaults.baseURL = API_URL;


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

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location = "/login";
    }
    return Promise.reject(error);
  }
);

export const getTasks = async () => {
  const result = await axios.get("/tasks");
  return result.data;
};

export const addTask = async (task) => {
  const result = await axios.post("/tasks", task);
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
