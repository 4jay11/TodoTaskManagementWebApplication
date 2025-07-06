import { useEffect } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";

// Import services
import { authAPI } from "./services/api";
import { initializeSocket } from "./services/socket";

// Import Redux actions
import { authSuccess, authFail } from "./store/slices/authSlice";
import { setDarkMode } from "./store/slices/uiSlice";

// Import your pages and layout
import Login from "./pages/Auth/Login";
import SignUp from "./pages/Auth/SignUp";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import OAuthSuccess from "./pages/OAuthSuccess";
import CreateTask from "./pages/CreateTask";
import ManageTasks from "./pages/ManageTasks";
import Members from "./pages/Members";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import TaskDetails from "./pages/TaskDetails";
import DashboardLayout from "./components/layouts/DashboardLayout";
import AuthLayout from "./components/layouts/AuthLayout";
import NotFound from "./pages/NotFound";

// Create router with protected routes
const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/",
        element: <Login />,
      },
      {
        path: "/signup",
        element: <SignUp />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "/reset-password/:token",
        element: <ResetPassword />,
      },
      {
        path: "/oauth-success",
        element: <OAuthSuccess />,
      },
    ],
  },
  {
    element: <DashboardLayout />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/create-task",
        element: <CreateTask />,
      },
      {
        path: "/manage-tasks",
        element: <ManageTasks />,
      },
      {
        path: "/members",
        element: <Members />,
      },
      {
        path: "/profile/:userId",
        element: <ProfilePage />,
      },
      {
        path: "/task/:id",
        element: <TaskDetails />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

function App() {
  const dispatch = useDispatch();
  const { darkMode } = useSelector((state) => state.ui);
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Check authentication status on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      checkAuthStatus();
    }
  }, []);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    dispatch(setDarkMode(savedDarkMode));
  }, [dispatch]);

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Initialize socket connection when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem("token");
      if (token) {
        initializeSocket(token);
      }
    }
  }, [isAuthenticated]);

  // Check if user is authenticated
  const checkAuthStatus = async () => {
    try {
      const response = await authAPI.getProfile();
      dispatch(authSuccess(response.data.data));
    } catch (error) {
      console.error("Authentication check failed:", error);
      dispatch(
        authFail(error.response?.data?.message || "Authentication failed")
      );
      localStorage.removeItem("token");
    }
  };

  return (
    <>
      {/* Global toast notifications */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme={darkMode ? "dark" : "light"}
      />

      {/* React Router configuration */}
      <RouterProvider router={router} />
    </>
  );
}

export default App;
