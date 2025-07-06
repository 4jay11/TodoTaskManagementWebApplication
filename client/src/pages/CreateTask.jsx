import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { tasksAPI, usersAPI } from "../services/api";

const CreateTask = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [members, setMembers] = useState([]);
  const [memberTaskMap, setMemberTaskMap] = useState({});

  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");

  const [attachments, setAttachments] = useState([]);
  const [attachmentInput, setAttachmentInput] = useState("");

  const [priority, setPriority] = useState("low");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");


  const [subtaskInput, setSubtaskInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  const {
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();


  // Fetch members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoadingMembers(true);
        const response = await usersAPI.getAllUsers();

        if (response.data?.data) {
          const filtered = response.data.data.filter(
            (m) => m._id !== user?._id
          );
          setMembers(filtered);
          console.log("filtered", filtered);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching members:", err);
        toast.error("Failed to load team members");
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [user]);

  // Log memberTaskMap
  useEffect(() => {
    console.log("Updated memberTaskMap:", memberTaskMap);
  }, [memberTaskMap]);

  // Member Tasks and Attachments
  const addMember = (_id) => {
    setMemberTaskMap((prevMap) => {
      const entry = { tasks: [], attachments: [] };
      return {
        ...prevMap,
        [_id]: entry,
      };
    });
  };
  const deleteMember = (_id) => {
    setMemberTaskMap((prevMap) => {
      const updatedMap = { ...prevMap };
      delete updatedMap[_id];
      return updatedMap;
    });
  };
  const handleAddSubtask = (memberId, task) => {
    if (!task?.trim()) return;
    setMemberTaskMap((prev) => {
      const updated = { ...prev };
      const existing = updated[memberId] || { tasks: [], attachments: [] };
      updated[memberId] = {
        ...existing,
        tasks: [...existing.tasks, task], // ✅ use 'tasks'
      };
      return updated;
    });
  };
  const handleRemoveSubtask = (memberId, index) => {
    setMemberTaskMap((prev) => {
      const updated = { ...prev };
      updated[memberId].tasks = updated[memberId].tasks.filter(
        (_, i) => i !== index
      );
      return updated;
    });
  };
  const handleAddAttachment = (memberId, link) => {
    if (!link?.trim()) return;
    setMemberTaskMap((prev) => {
      const updated = { ...prev };
      const existing = updated[memberId] || { tasks: [], attachments: [] };
      updated[memberId] = {
        ...existing,
        attachments: [...existing.attachments, link],
      };
      return updated;
    });
  };
  const handleRemoveAttachment = (memberId, index) => {
    setMemberTaskMap((prev) => {
      const updated = { ...prev };
      updated[memberId].attachments = updated[memberId].attachments.filter(
        (_, i) => i !== index
      );
      return updated;
    });
  };

  // Add Tasks
  const handleAddTask = () => {
    const trimmed = taskInput.trim();
    if (!trimmed) return;

    const newTask = {
      id: Date.now(),
      title: trimmed,
    };

    setTasks((prev) => [...prev, newTask]);
    setTaskInput("");
  };
  // Remove Task
  const handleRemoveTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  // Add Attachments
  const addAttachment = () => {
    const trimmed = attachmentInput.trim();
    if (!trimmed) return;

    setAttachments((prev) => [...prev, trimmed]);
    setAttachmentInput("");
  };

  const removeAttachment = (urlToRemove) => {
    setAttachments((prev) => prev.filter((url) => url !== urlToRemove));
  };

  const onSubmit = async () => {
    try {
      setLoading(true);

      const taskData = {
        title: title,
        description: description,
        priority: priority,
        status: "pending",
        deadline: deadline,
        assignedMembers: Object.keys(memberTaskMap),
        subtasks: tasks.map((t) => ({ title: t.title })),
        attachments: attachments,
        memberTaskMap: memberTaskMap,
      };

      console.log("taskData", taskData);

      const response = await tasksAPI.createTask(taskData);
      toast.success("Task created successfully");
      navigate(`/task/${response.data.data._id}`);
    } catch (err) {
      console.error("Error creating task:", err);
      
      toast.error(err.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Create New Task
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Task title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Task Title*
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter task title"
              disabled={loading}
            />
          </div>

          {/* Task description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Describe the task details"
              disabled={loading}
            ></textarea>
          </div>

          {/* Priority and deadline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={loading}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              {/* Priority indicator */}
              <div className="mt-2 flex items-center">
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    priority === "high"
                      ? "bg-red-500"
                      : priority === "medium"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                ></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {priority === "high"
                    ? "High Priority"
                    : priority === "medium"
                    ? "Medium Priority"
                    : "Low Priority"}
                </span>
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label
                htmlFor="deadline"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Deadline
              </label>
              <input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={format(new Date(), "yyyy-MM-dd")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={loading}
              />
            </div>
          </div>

          {/* Tasks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subtasks
            </label>

            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="Add a subtask"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTask();
                  }
                }}
                disabled={loading}
              />
              <button
                type="button"
                onClick={handleAddTask}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Add
              </button>
            </div>

            {tasks.length > 0 ? (
              <ul className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded-md"
                  >
                    <span className="text-gray-800 dark:text-gray-200">
                      {task.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTask(task.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      disabled={loading}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                No subtasks added yet
              </p>
            )}
          </div>
          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Attachments
            </label>

            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={attachmentInput}
                onChange={(e) => setAttachmentInput(e.target.value)}
                placeholder="Add a attachment"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAttachment();
                  }
                }}
                disabled={loading}
              />
              <button
                type="button"
                onClick={addAttachment}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Add
              </button>
            </div>

            {attachments.length > 0 ? (
              <ul className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                {attachments.map((attachment, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded-md"
                  >
                    <a
                      href={attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline dark:text-blue-400 truncate max-w-xs"
                    >
                      {attachment}
                    </a>
                    <button
                      type="button"
                      onClick={() => removeAttachment(attachment)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      disabled={loading}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                No Attachement added yet
              </p>
            )}
          </div>
          {/* Assign members */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Assigned Members
            </label>
            <div className="flex flex-col space-y-2">
              <button
                type="button"
                onClick={() => setIsMemberModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 w-full md:w-auto"
                disabled={loading || loadingMembers}
              >
                {loadingMembers ? "Loading Members..." : "Select Members"}
              </button>

              {Object.keys(memberTaskMap).length > 0 ? (
                <div className="mt-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Selected Members ({Object.keys(memberTaskMap).length})
                  </h4>

                  <div className="space-y-4">
                    {Object.entries(memberTaskMap).map(([userId, data]) => {
                      const member = members.find((m) => m._id === userId);
                      if (!member) return null;

                      const currentMemberData = data;

                      return (
                        <div
                          key={member._id}
                          className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md shadow-md"
                        >
                          {/* Member Info */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <img
                                src={
                                  member.avatar ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    member.name
                                  )}&background=random`
                                }
                                alt={member.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <div className="ml-2">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {member.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {member.email}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                handleRemoveMember(member._id);
                                deleteMember(member._id); // ⛔ remove from map
                              }}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              disabled={loading}
                            >
                              Remove
                            </button>
                          </div>

                          {/* Subtasks Accordion */}
                          <details className="mt-4 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600 p-3">
                            <summary className="font-medium cursor-pointer text-gray-800 dark:text-white">
                              Subtasks
                            </summary>
                            <div className="mt-3 space-y-2">
                              {currentMemberData.tasks.map((task, i) => (
                                <div
                                  key={i}
                                  className="flex justify-between items-center bg-gray-100 dark:bg-gray-600 p-2 rounded"
                                >
                                  <span className="text-sm text-gray-800 dark:text-white">
                                    {task}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveSubtask(member._id, i)
                                    }
                                    className="text-red-500 text-xs hover:underline"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Enter subtask"
                                  className="w-full px-3 py-1 border rounded-md text-sm"
                                  value={subtaskInput[member._id] || ""}
                                  onChange={(e) =>
                                    setSubtaskInput({
                                      ...subtaskInput,
                                      [member._id]: e.target.value,
                                    })
                                  }
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleAddSubtask(
                                      member._id,
                                      subtaskInput[member._id]
                                    );
                                    setSubtaskInput("");
                                  }}
                                  className="bg-blue-500 text-white text-sm px-3 rounded hover:bg-blue-600"
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          </details>

                          {/* Attachments Accordion */}
                          <details className="mt-4 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600 p-3">
                            <summary className="font-medium cursor-pointer text-gray-800 dark:text-white">
                              Attachments
                            </summary>
                            <div className="mt-3 space-y-2">
                              {currentMemberData.attachments.map(
                                (attachment, i) => (
                                  <div
                                    key={i}
                                    className="flex justify-between items-center bg-gray-100 dark:bg-gray-600 p-2 rounded"
                                  >
                                    <span className="text-sm text-gray-800 dark:text-white">
                                      {attachment}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveAttachment(member._id, i)
                                      }
                                      className="text-red-500 text-xs hover:underline"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                )
                              )}

                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Paste link"
                                  className="w-full px-3 py-1 border rounded-md text-sm"
                                  value={attachmentInput[member._id] || ""}
                                  onChange={(e) =>
                                    setAttachmentInput((prev) => ({
                                      ...prev,
                                      [member._id]: e.target.value,
                                    }))
                                  }
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const link =
                                      attachmentInput[member._id]?.trim();
                                    if (link) {
                                      handleAddAttachment(member._id, link);
                                      setAttachmentInput((prev) => ({
                                        ...prev,
                                        [member._id]: "",
                                      }));
                                    }
                                  }}
                                  className="bg-blue-500 text-white text-sm px-3 rounded hover:bg-blue-600"
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          </details>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  No members assigned yet
                </p>
              )}
            </div>
          </div>
          {/* Submit button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mr-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
      {/* Member selection modal */}
      {isMemberModalOpen && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 bg-white border border-gray-300 rounded-xl shadow-lg w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-semibold text-gray-800">
              Select Members
            </h1>
            <button
              onClick={() => setIsMemberModalOpen(false)}
              className="text-gray-500 hover:text-red-500 text-xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {members.map((member) => (
              <label
                key={member._id}
                className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-md cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-blue-600"
                  checked={!!memberTaskMap[member._id]}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    console.log("Checkbox status:", isChecked);

                    if (isChecked) {
                      addMember(member._id);
                    } else {
                      deleteMember(member._id);
                    }
                  }}
                />

                <img
                  src={
                    member.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      member.name
                    )}&background=random`
                  }
                  alt={member.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-gray-800 font-medium">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setIsMemberModalOpen(false)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTask;