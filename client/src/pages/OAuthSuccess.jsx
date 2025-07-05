import { useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";  
const OAuthSuccess = () => {
  const navigate = useNavigate();
  useEffect(() => {
    toast.success("Login successful via OAuth!");
    navigate("/");
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <h2 className="text-2xl font-semibold mb-4">🎉 Login Successful!</h2>
      <p>Redirecting you to your dashboard...</p>
    </div>
  );
};

export default OAuthSuccess;
