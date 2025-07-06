import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { authSuccess } from "../store/slices/authSlice";

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // Parse token and user data from URL hash or query params
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userData = params.get("user");

    if (token && userData) {
      try {
        // Store token
        localStorage.setItem("token", token);

        // Parse and store user data
        const user = JSON.parse(decodeURIComponent(userData));
        dispatch(authSuccess(user));

        // Redirect to dashboard
        navigate("/dashboard");
      } catch (error) {
        console.error("Error parsing OAuth data:", error);
        navigate("/");
      }
    } else {
      // If no token or user data, redirect to login
      navigate("/");
    }
  }, [dispatch, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <h2 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-300">
          Completing login...
        </h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Please wait while we redirect you.
        </p>
      </div>
    </div>
  );
};

export default OAuthSuccess;
