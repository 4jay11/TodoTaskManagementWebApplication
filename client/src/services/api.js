import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Create axios instance with defaults
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle session expiration
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      // Redirect to login if not already there
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  logout: () => api.post("/auth/logout"),
  getProfile: () => api.get("/auth/me"),
  updateProfile: (userData) => api.put("/auth/me", userData),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) =>
    api.post(`/auth/reset-password/${token}`, { password }),
  deleteAccount: () => api.delete("/auth/me"),
};

// Tasks API
export const tasksAPI = {
  getAllTasks: () => api.get("/tasks"),
  getTaskById: (id) => api.get(`/tasks/${id}`),
  createTask: (taskData) => api.post("/tasks", taskData),
  updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  getTaskSubtasks: (id) => api.get(`/tasks/${id}/subtasks`),
  updateTaskStatus: (id, status) => api.patch(`/tasks/${id}`, { status }),
  updateTaskPriority: (id, priority) => api.patch(`/tasks/${id}`, { priority }),
  assignMembers: (id, memberIds) =>
    api.patch(`/tasks/${id}`, { assignedMembers: memberIds }),
  addAttachment: (id, attachmentUrl) =>
    api.patch(`/tasks/${id}`, {
      $push: { attachments: attachmentUrl },
    }),
  removeAttachment: (id, attachmentUrl) =>
    api.patch(`/tasks/${id}`, {
      $pull: { attachments: attachmentUrl },
    }),
};

// User Tasks API
export const userTasksAPI = {
  getAllUserTasks: () => api.get("/user-tasks"),
  getUserTaskById: (id) => api.get(`/user-tasks/${id}`),
  createUserTask: (userTaskData) => api.post("/user-tasks", userTaskData),
  updateUserTask: (id, userTaskData) =>
    api.put(`/user-tasks/${id}`, userTaskData),
  updateUserTaskStatus: (id, status) =>
    api.patch(`/user-tasks/${id}`, { status }),
  deleteUserTask: (id) => api.delete(`/user-tasks/${id}`),
  getSubtasks: (id) => api.get(`/user-tasks/${id}/subtasks`),
  addSubtask: (id, subtaskData) =>
    api.post(`/user-tasks/${id}/subtasks`, subtaskData),
  addAttachment: (id, attachmentUrl) =>
    api.patch(`/user-tasks/${id}`, {
      $push: { attachments: attachmentUrl },
    }),
  removeAttachment: (id, attachmentUrl) =>
    api.patch(`/user-tasks/${id}`, {
      $pull: { attachments: attachmentUrl },
    }),
};

// Subtasks API
export const subtasksAPI = {
  createSubtask: (subtaskData) => api.post("/subtasks", subtaskData),
  getSubtaskById: (id) => api.get(`/subtasks/${id}`),
  updateSubtask: (id, subtaskData) => api.put(`/subtasks/${id}`, subtaskData),
  updateSubtaskStatus: (id, status) => api.patch(`/subtasks/${id}/${status}`),
  deleteSubtask: (id) => api.delete(`/subtasks/${id}`),
  addAttachment: (id, attachmentUrl) =>
    api.patch(`/subtasks/${id}`, {
      $push: { attachments: attachmentUrl },
    }),
  removeAttachment: (id, attachmentUrl) =>
    api.patch(`/subtasks/${id}`, {
      $pull: { attachments: attachmentUrl },
    }),
};

// Users API (for member management)
export const usersAPI = {
  getAllUsers: () => api.get("/auth/users"),
  getUserById: (id) => api.get(`/auth/users/${id}`),
  searchUsersByEmail: (email) => api.post("/auth/users/search", { email }),
};

export default api;
