import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { format } from "date-fns";

import { tasksAPI, subtasksAPI} from "../services/api";
import { updateTask, deleteTask } from "../store/slices/taskSlice";

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [newSubtask, setNewSubtask] = useState("");
  const [newAttachment, setNewAttachment] = useState("");
  const [expandedMembers, setExpandedMembers] = useState({});
  const [subtaskInput, setSubtaskInput] = useState("");
  const [attachmentInput, setAttachmentInput] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);

  const userId = user._id;

  // Check if user is the task creator
  const isCreator = task?.creator?._id === userId;

  // Check if user is assigned to this task
  const isAssigned =
    task &&
    user &&
    task.assignedMembers.some((member) => member._id === user._id);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        setLoading(true);
        const response = await tasksAPI.getTaskById(id);
        setTask(response.data.data);
        setEditData({
          title: response.data.data.title,
          description: response.data.data.description || "",
          priority: response.data.data.priority || "low",
          status: response.data.data.status || "pending",
          deadline: response.data.data.deadline
            ? format(new Date(response.data.data.deadline), "yyyy-MM-dd")
            : "",
        });
      } catch (error) {
        console.error("Error fetching task details:", error);
        toast.error("Failed to load task details");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [id, navigate]);

  const handleUpdateTask = async () => {
    try {
      const response = await tasksAPI.updateTask(id, editData);
      setTask(response.data.data);
      dispatch(updateTask(response.data.data));
      setIsEditing(false);
      toast.success("Task updated successfully");
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error(error.response?.data?.message || "Failed to update task");
    }
  };

  const handleDeleteTask = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await tasksAPI.deleteTask(id);
        dispatch(deleteTask(id));
        toast.success("Task deleted successfully");
        navigate("/dashboard");
      } catch (error) {
        console.error("Error deleting task:", error);
        toast.error(error.response?.data?.message || "Failed to delete task");
      }
    }
  };

  const handleAddSubtask = async () => {
    if (!newSubtask.trim()) return;

    try {
      const subtaskData = {
        title: newSubtask.trim(),
        status: "pending",
      };

      const response = await tasksAPI.createTask(id, {
        subtasks: [subtaskData],
      });
      setTask({
        ...task,
        subtasks: [...(task.subtasks || []), response.data.data],
      });
      setNewSubtask("");
      toast.success("Subtask added successfully");
    } catch (error) {
      console.error("Error adding subtask:", error);
      toast.error(error.response?.data?.message || "Failed to add subtask");
    }
  };

const handleUpdateSubtaskStatus = async (subtaskId, currentStatus) => {
  const newStatus = currentStatus;
  try {
    await subtasksAPI.updateSubtaskStatus(subtaskId, newStatus);
    toast.success("Subtask status updated successfully");
    setRefreshKey((prev) => prev + 1);
  } catch (error) {
    console.error("Error updating subtask status:", error);
    toast.error("Failed to update subtask status");
  }
};


  const handleAddAttachment = async () => {
    if (!newAttachment.trim()) return;

    try {
      const response = await tasksAPI.updateTask(id, {
        attachments: [...(task.attachments || []), newAttachment.trim()],
      });
      setTask(response.data.data);
      setNewAttachment("");
      toast.success("Attachment added successfully");
    } catch (error) {
      console.error("Error adding attachment:", error);
      toast.error("Failed to add attachment");
    }
  };

  // Status color mapping
  const statusColors = {
    completed:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    "in-progress":
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    pending:
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    overdue: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  // Priority color mapping
  const priorityColors = {
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    medium:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  };

  // Toggle member accordion
  const toggleMemberAccordion = (memberId) => {
    setExpandedMembers((prev) => ({
      ...prev,
      [memberId]: !prev[memberId],
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Task not found
        </h2>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {/* Task Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
                  className="w-full text-2xl font-bold mb-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              ) : (
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {task.title}
                </h1>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {isEditing ? (
                  <select
                    value={editData.status}
                    onChange={(e) =>
                      setEditData({ ...editData, status: e.target.value })
                    }
                    className="px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                  </select>
                ) : (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      statusColors[task.status]
                    }`}
                  >
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </span>
                )}

                {isEditing ? (
                  <select
                    value={editData.priority}
                    onChange={(e) =>
                      setEditData({ ...editData, priority: e.target.value })
                    }
                    className="px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                ) : (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      priorityColors[task.priority]
                    }`}
                  >
                    {task.priority.charAt(0).toUpperCase() +
                      task.priority.slice(1)}{" "}
                    Priority
                  </span>
                )}
              </div>

              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <span className="mr-4">Created by: {task.creator.name}</span>
                <span>
                  Created: {format(new Date(task.createdAt), "MMM dd, yyyy")}
                </span>
              </div>
            </div>

            <div className="flex space-x-2">
              {isCreator && !isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteTask}
                    className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </>
              )}
              {isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateTask}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Task Content */}
        <div className="p-6">
          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Description
            </h2>
            {isEditing ? (
              <textarea
                value={editData.description}
                onChange={(e) =>
                  setEditData({ ...editData, description: e.target.value })
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              ></textarea>
            ) : (
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {task.description || "No description provided."}
              </p>
            )}
          </div>

          {/* Deadline */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Deadline
            </h2>
            {isEditing ? (
              <input
                type="date"
                value={editData.deadline}
                onChange={(e) =>
                  setEditData({ ...editData, deadline: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            ) : (
              <p className="text-gray-700 dark:text-gray-300">
                {task.deadline
                  ? format(new Date(task.deadline), "MMMM dd, yyyy")
                  : "No deadline set"}
              </p>
            )}
          </div>

          {/* Assigned Members */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Assigned Members
            </h2>
            {task.userTasks && task.userTasks.length > 0 ? (
              <div className="space-y-2">
                {task.userTasks.map((userTask) => (
                  <div
                    key={userTask._id}
                    className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden"
                  >
                    {/* Member header (accordion trigger) */}
                    <div
                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 cursor-pointer"
                      onClick={() => toggleMemberAccordion(userTask._id)}
                    >
                      <div className="flex items-center">
                        <img
                          src={
                            userTask.assignedTo.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              userTask.assignedTo.name
                            )}&background=random`
                          }
                          alt={userTask.assignedTo.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {userTask.assignedTo.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {userTask.assignedTo.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${
                            statusColors[userTask.status]
                          }`}
                        >
                          {userTask.status}
                        </span>
                        <svg
                          className={`w-5 h-5 text-gray-500 dark:text-gray-400 transform ${
                            expandedMembers[userTask._id] ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Member accordion content */}
                    {expandedMembers[userTask._id] && (
                      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                        {/* Member-specific subtasks */}
                        <div className="mb-4">
                          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Member-specific Subtasks
                          </h3>

                          {/* Add member-specific subtask form (for creator only) */}
                          {isCreator && (
                            <div className="flex gap-2 mb-3">
                              <input
                                type="text"
                                value={
                                  selectedMember === userTask.assignedTo._id
                                    ? subtaskInput
                                    : ""
                                }
                                onChange={(e) => {
                                  setSubtaskInput(e.target.value);
                                  setSelectedMember(userTask.assignedTo._id);
                                }}
                                placeholder={`Add subtask for ${userTask.assignedTo.name}`}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                onFocus={() =>
                                  setSelectedMember(userTask.assignedTo._id)
                                }
                              />
                              <button
                                onClick={handleAddSubtask}
                                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
                                disabled={
                                  !subtaskInput.trim() ||
                                  selectedMember !== userTask.assignedTo._id
                                }
                              >
                                Add
                              </button>
                            </div>
                          )}

                          {/* Member subtasks list */}
                          {userTask.subtasks?.length > 0 ? (
                            <ul className="space-y-2">
                              {userTask.subtasks.map((subtask) => (
                                <li
                                  key={subtask._id}
                                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg shadow-sm"
                                >
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={subtask.status === "completed"}
                                      onChange={() =>
                                        handleUpdateSubtaskStatus(
                                          subtask._id,
                                          subtask.status
                                        )
                                      }
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                      disabled={
                                        !isCreator &&
                                        userTask.assignedTo?._id !== user?._id
                                      }
                                    />
                                    <span
                                      className={`text-sm font-medium ${
                                        subtask.status === "completed"
                                          ? "line-through text-gray-500 dark:text-gray-400"
                                          : "text-gray-800 dark:text-gray-200"
                                      }`}
                                    >
                                      {subtask.title}
                                    </span>
                                  </div>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                      statusColors[subtask.status] ||
                                      "bg-gray-200 text-gray-800"
                                    }`}
                                  >
                                    {subtask.status}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              No member-specific subtasks
                            </p>
                          )}
                        </div>

                        {/* Member-specific attachments */}
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Member-specific Attachments
                          </h3>

                          {/* Add member-specific attachment form (for creator only) */}
                          {isCreator && (
                            <div className="flex gap-2 mb-3">
                              <input
                                type="url"
                                value={
                                  selectedMember === userTask.assignedTo._id
                                    ? attachmentInput
                                    : ""
                                }
                                onChange={(e) => {
                                  setAttachmentInput(e.target.value);
                                  setSelectedMember(userTask.assignedTo._id);
                                }}
                                placeholder={`Add attachment for ${userTask.assignedTo.name}`}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                onFocus={() =>
                                  setSelectedMember(userTask.assignedTo._id)
                                }
                              />
                              <button
                                onClick={handleAddAttachment}
                                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
                                disabled={
                                  !attachmentInput.trim() ||
                                  selectedMember !== userTask.assignedTo._id
                                }
                              >
                                Add
                              </button>
                            </div>
                          )}

                          {/* Member attachments list */}
                          {userTask.attachments &&
                          userTask.attachments.length > 0 ? (
                            <ul className="space-y-2">
                              {userTask.attachments.map((url, index) => (
                                <li
                                  key={index}
                                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded-md"
                                >
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline dark:text-blue-400 truncate max-w-xs text-sm"
                                  >
                                    {url}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              No member-specific attachments
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No members assigned to this task.
              </p>
            )}
          </div>

          {/* Subtasks */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Subtasks
            </h2>
            {isCreator && isEditing && (
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Add a subtask"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                />
                <button
                  onClick={handleAddSubtask}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            )}

            {task.subtasks && task.subtasks.length > 0 ? (
              <ul className="space-y-2">
                {task.subtasks.map((subtask) => (
                  <li
                    key={subtask._id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
                  >
                    <div className="flex items-center">
                      {isCreator || isAssigned ? (
                        <input
                          type="checkbox"
                          checked={subtask.status === "completed"}
                          onChange={() =>
                            handleUpdateSubtaskStatus(
                              subtask._id,
                              subtask.status === "completed"
                                ? "pending"
                                : "completed"
                            )
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      ) : (
                        <div
                          className={`h-3 w-3 rounded-full mr-1 ${
                            subtask.status === "completed"
                              ? "bg-green-500"
                              : subtask.status === "in-progress"
                              ? "bg-yellow-500"
                              : "bg-gray-300"
                          }`}
                        ></div>
                      )}
                      <span
                        className={`ml-2 ${
                          subtask.status === "completed"
                            ? "line-through text-gray-500 dark:text-gray-400"
                            : "text-gray-800 dark:text-gray-200"
                        }`}
                      >
                        {subtask.title}
                      </span>
                    </div>
                    {(isCreator || isAssigned) &&
                      subtask.status !== "completed" && (
                        <select
                          value={subtask.status}
                          onChange={(e) =>
                            handleUpdateSubtaskStatus(
                              subtask._id,
                              e.target.value
                            )
                          }
                          className="text-sm border border-gray-300 rounded px-2 py-1 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No subtasks added yet.
              </p>
            )}
          </div>

          {/* Attachments */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Attachments
            </h2>
            {isCreator && isEditing && (
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newAttachment}
                  onChange={(e) => setNewAttachment(e.target.value)}
                  placeholder="Add attachment URL"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddAttachment();
                    }
                  }}
                />
                <button
                  onClick={handleAddAttachment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            )}

            {task.attachments && task.attachments.length > 0 ? (
              <ul className="space-y-2">
                {task.attachments.map((attachment, index) => (
                  <li key={index} className="flex items-center">
                    <a
                      href={attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {attachment}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No attachments added yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
