import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";


import {
  fetchTasksStart,
  fetchTasksSuccess,
  fetchTasksFail,
} from "../store/slices/taskSlice";
import { tasksAPI } from "../services/api";
import TaskCard from "../components/TaskCard";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { tasks, taskStats, loading, error } = useSelector(
    (state) => state.tasks
  );
  const [upcomingTasks, setUpcomingTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        dispatch(fetchTasksStart());
        const response = await tasksAPI.getAllTasks();
        dispatch(fetchTasksSuccess(response.data.data));
      } catch (error) {
        console.error("Error fetching tasks:", error);
        dispatch(fetchTasksFail(error.message));
      }
    };

    fetchTasks();
  }, [dispatch]);

  useEffect(() => {
    // Filter tasks with upcoming deadlines (within 7 days)
    const now = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(now.getDate() + 7);

    const upcoming = tasks
      .filter((task) => {
        const deadline = new Date(task.deadline);
        return (
          deadline >= now &&
          deadline <= sevenDaysLater &&
          task.status !== "completed"
        );
      })
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    setUpcomingTasks(upcoming.slice(0, 5)); // Show only 5 upcoming tasks
  }, [tasks]);

  // Prepare data for pie chart
  const chartData = [
    { name: "Completed", value: taskStats.completed, color: "#10B981" }, // Green
    { name: "In Progress", value: taskStats.inProgress, color: "#FBBF24" }, // Yellow
    { name: "Pending", value: taskStats.pending, color: "#F97316" }, // Orange
    { name: "Overdue", value: taskStats.overdue, color: "#EF4444" }, // Red
  ].filter((item) => item.value > 0); // Only show statuses with tasks

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Welcome back, {user?.name || "User"}!
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-400">
                {error || "Failed to load tasks. Please try again."}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Task Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Task Status Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Task Status
              </h2>
              {chartData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} tasks`, "Count"]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    No tasks available
                  </p>
                </div>
              )}
            </div>

            {/* Task Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg shadow p-4">
                <h3 className="text-green-700 dark:text-green-400 font-medium">
                  Completed
                </h3>
                <div className="mt-2 flex items-baseline">
                  <p className="text-3xl font-semibold text-green-600 dark:text-green-300">
                    {taskStats.completed}
                  </p>
                  <p className="ml-2 text-sm text-green-600 dark:text-green-400">
                    tasks
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg shadow p-4">
                <h3 className="text-yellow-700 dark:text-yellow-400 font-medium">
                  In Progress
                </h3>
                <div className="mt-2 flex items-baseline">
                  <p className="text-3xl font-semibold text-yellow-600 dark:text-yellow-300">
                    {taskStats.inProgress}
                  </p>
                  <p className="ml-2 text-sm text-yellow-600 dark:text-yellow-400">
                    tasks
                  </p>
                </div>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg shadow p-4">
                <h3 className="text-orange-700 dark:text-orange-400 font-medium">
                  Pending
                </h3>
                <div className="mt-2 flex items-baseline">
                  <p className="text-3xl font-semibold text-orange-600 dark:text-orange-300">
                    {taskStats.pending}
                  </p>
                  <p className="ml-2 text-sm text-orange-600 dark:text-orange-400">
                    tasks
                  </p>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow p-4">
                <h3 className="text-red-700 dark:text-red-400 font-medium">
                  Overdue
                </h3>
                <div className="mt-2 flex items-baseline">
                  <p className="text-3xl font-semibold text-red-600 dark:text-red-300">
                    {taskStats.overdue}
                  </p>
                  <p className="ml-2 text-sm text-red-600 dark:text-red-400">
                    tasks
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Upcoming Deadlines
            </h2>
            {upcomingTasks.length > 0 ? (
              <div className="space-y-4">
                {upcomingTasks.map((task) => (
                  <TaskCard key={task._id} task={task} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 py-4">
                No upcoming deadlines in the next 7 days
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
