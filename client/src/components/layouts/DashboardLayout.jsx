import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import SideMenu from "./SideMenu";
import Header from "./Header";

const DashboardLayout = () => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const { sidebarOpen } = useSelector((state) => state.ui);
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <SideMenu />

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col overflow-hidden ${
          sidebarOpen ? "ml-64" : "ml-16"
        } transition-all duration-300`}
      >
        {/* Header */}
        <Header />

        {/* Main content area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4">
          <div className="container mx-auto px-4 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
