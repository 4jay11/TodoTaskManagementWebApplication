import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tasks: [],
  userTasks: [],
  currentTask: null,
  loading: false,
  error: null,
  taskStats: {
    completed: 0,
    inProgress: 0,
    pending: 0,
    overdue: 0,
  },
  filters: {
    status: null,
    priority: null,
    search: "",
    member: null,
    dateRange: null,
  },
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    // Task loading states
    fetchTasksStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchTasksSuccess: (state, action) => {
      state.tasks = action.payload;
      state.loading = false;
      state.error = null;
      // Calculate task statistics
      state.taskStats = calculateTaskStats(action.payload);
    },
    fetchTasksFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // User tasks
    fetchUserTasksSuccess: (state, action) => {
      state.userTasks = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Current task
    setCurrentTask: (state, action) => {
      state.currentTask = action.payload;
    },

    // Task operations
    addTask: (state, action) => {
      state.tasks.push(action.payload);
      state.taskStats = calculateTaskStats(state.tasks);
    },
    updateTask: (state, action) => {
      const index = state.tasks.findIndex(
        (task) => task._id === action.payload._id
      );
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
      state.taskStats = calculateTaskStats(state.tasks);

      // Update current task if it's the one being updated
      if (state.currentTask && state.currentTask._id === action.payload._id) {
        state.currentTask = action.payload;
      }
    },
    deleteTask: (state, action) => {
      state.tasks = state.tasks.filter((task) => task._id !== action.payload);
      state.taskStats = calculateTaskStats(state.tasks);

      // Clear current task if it's the one being deleted
      if (state.currentTask && state.currentTask._id === action.payload) {
        state.currentTask = null;
      }
    },

    // Filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: null,
        priority: null,
        search: "",
        member: null,
        dateRange: null,
      };
    },
  },
});

// Helper function to calculate task statistics
const calculateTaskStats = (tasks) => {
  return tasks.reduce(
    (stats, task) => {
      switch (task.status) {
        case "completed":
          stats.completed += 1;
          break;
        case "in-progress":
          stats.inProgress += 1;
          break;
        case "pending":
          stats.pending += 1;
          break;
        case "overdue":
          stats.overdue += 1;
          break;
        default:
          break;
      }
      return stats;
    },
    { completed: 0, inProgress: 0, pending: 0, overdue: 0 }
  );
};

export const {
  fetchTasksStart,
  fetchTasksSuccess,
  fetchTasksFail,
  fetchUserTasksSuccess,
  setCurrentTask,
  addTask,
  updateTask,
  deleteTask,
  setFilters,
  clearFilters,
} = taskSlice.actions;

export default taskSlice.reducer;
