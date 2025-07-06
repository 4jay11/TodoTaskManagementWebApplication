import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const NotFound = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-6xl font-bold text-blue-600 dark:text-blue-400">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mt-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to={isAuthenticated ? "/dashboard" : "/"}
            className="inline-block px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isAuthenticated ? "Back to Dashboard" : "Back to Login"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
