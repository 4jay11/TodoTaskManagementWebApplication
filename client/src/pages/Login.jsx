import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
const Login = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    try {
      const error = searchParams.get("error");
      if (error === "oauth_error") {
        toast.error("OAuth login failed. Please try again.");
      } else if (error === "user_not_found") {
        toast.warn("No user found with that social login.");
      }
    } catch (err) {
      toast.error("Error accessing search params:", err);
    }
  }, [searchParams]);

  return (
    <div className="p-4 text-center">
      <h2 className="text-xl font-semibold">Login Page</h2>
      <p>If you're seeing this, the login route is working!</p>
      <button onClick={() => {
        window.location.href = "http://localhost:8000/api/auth/google";
      }}>
        Login with Google
      </button>
    </div>
  );
};

export default Login;
