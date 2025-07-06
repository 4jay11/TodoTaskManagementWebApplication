import React, { useState, useEffect } from "react";
import TaskCard from "../components/TaskCard";
import { tasksAPI } from "../services/api";
import { useSelector } from "react-redux";
const filters = ["All", "Completed", "In Progress", "Pending", "Overdue"];

const ManageTasks = () => {
  const [taskType, setTaskType] = useState("myTasks");
  const [activeFilter, setActiveFilter] = useState("All");
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(false);


  const { user } = useSelector((state) => state.auth);
  const myUserId = user._id;
  console.log("myUserId", myUserId);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await tasksAPI.getAllTasks();
        const fetchedTasks = response.data.data || [];
        setAllTasks(fetchedTasks);
        console.log("Fetched tasks:", fetchedTasks);
      } catch (err) {
        console.error("Failed to load tasks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const isMyTask = (task, myUserId) => {
    return (
      String(task.creator?._id) &&
      task.assignedMembers?.some(
        (member) => String(member._id) === String(task.creator._id)
      ) &&
      String(task.creator._id) === String(myUserId)
    );
  };

  const isAssignedTask = (task, myUserId) => {
    return (
      String(task.creator?._id) &&
      task.assignedMembers?.some(
        (member) => String(member._id) !== String(task.creator._id)
      ) &&
      String(task.creator._id)=== String(myUserId)
    );
  };

  const myTasks = allTasks.filter((task) => isMyTask(task, myUserId));
  const assignedTasks = allTasks.filter((task) =>
    isAssignedTask(task, myUserId)
  );

  console.log("myTasks", myTasks);
  console.log("assignedTasks", assignedTasks);

  const tasksToShow = taskType === "myTasks" ? myTasks : assignedTasks;

  // Filter tasks by status
  const filteredTasks =
    activeFilter === "All"
      ? tasksToShow
      : tasksToShow.filter(
          (task) =>
            task.status.toLowerCase() ===
            activeFilter.toLowerCase().replace(" ", "-")
        );

  return (
    <div className="p-6">
      {/* Filter Controls */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <select
          value={taskType}
          onChange={(e) => setTaskType(e.target.value)}
          className="border px-3 py-1 rounded shadow-sm text-sm"
        >
          <option value="myTasks">My Tasks</option>
          <option value="sharedTasks">Shared Tasks</option>
        </select>

        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1 rounded-full text-sm ${
                activeFilter === f
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-blue-100"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Task Cards */}
      {loading ? (
        <p className="text-gray-600 dark:text-gray-300">Loading tasks...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => <TaskCard key={task._id} task={task} />)
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No tasks found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageTasks;
