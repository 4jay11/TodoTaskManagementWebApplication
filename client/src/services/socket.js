import { io } from "socket.io-client";
import { store } from "../store";
import { addTask, updateTask, deleteTask } from "../store/slices/taskSlice";
import { addNotification } from "../store/slices/uiSlice";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

let socket;

export const initializeSocket = (token) => {
  if (socket) return socket;

  // Connect to the socket server with authentication
  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    withCredentials: true,
  });

  // Set up event listeners
  socket.on("connect", () => {
    console.log("Socket connected");
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  // Task events
  socket.on("task:created", (task) => {
    store.dispatch(addTask(task));
    store.dispatch(
      addNotification({
        type: "success",
        message: `New task created: ${task.title}`,
      })
    );
  });

  socket.on("task:updated", (task) => {
    store.dispatch(updateTask(task));
    store.dispatch(
      addNotification({
        type: "info",
        message: `Task updated: ${task.title}`,
      })
    );
  });

  socket.on("task:deleted", (taskId) => {
    store.dispatch(deleteTask(taskId));
    store.dispatch(
      addNotification({
        type: "warning",
        message: "A task has been deleted",
      })
    );
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default {
  initializeSocket,
  disconnectSocket,
  getSocket: () => socket,
};
