// src/components/task/TaskDetails.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { format } from "date-fns";

import { tasksAPI, subtasksAPI } from "../../services/api";
import { updateTask, deleteTask } from "../../store/slices/taskSlice";

import TaskHeader from "./TaskHeader";
import TaskDescription from "./TaskDescription";
import TaskDeadline from "./TaskDeadline";
import TaskMembers from "./TaskMembers";
import TaskSubtasks from "./TaskSubtasks";
import TaskAttachments from "./TaskAttachments";

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
  const [refreshKey, setRefreshKey] = useState(0);

  const userId = user._id;
  const isCreator = task?.creator?._id === userId;
  const isAssigned = task?.assignedMembers?.some((m) => m._id === userId);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        setLoading(true);
        const res = await tasksAPI.getTaskById(id);
        const data = res.data.data;
        setTask(data);
        setEditData({
          title: data.title,
          description: data.description || "",
          priority: data.priority || "low",
          status: data.status || "pending",
          deadline: data.deadline
            ? format(new Date(data.deadline), "yyyy-MM-dd")
            : "",
        });
      } catch (err) {
        toast.error("Failed to load task details");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchTaskDetails();
  }, [id, navigate, refreshKey]);

  const handleUpdateTask = async () => {
    try {
      const res = await tasksAPI.updateTask(id, editData);
      dispatch(updateTask(res.data.data));
      setTask(res.data.data);
      setIsEditing(false);
      toast.success("Task updated successfully");
    } catch (err) {
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await tasksAPI.deleteTask(id);
      dispatch(deleteTask(id));
      toast.success("Task deleted");
      navigate("/dashboard");
    } catch (err) {
      toast.error("Failed to delete task");
    }
  };

  const handleAddSubtask = async (title) => {
    if (!title.trim()) return;
    try {
      const response = await tasksAPI.createTask(id, {
        subtasks: [{ title, status: "pending" }],
      });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error("Failed to add subtask");
    }
  };

  const handleUpdateSubtaskStatus = async (subtaskId, newStatus) => {
    try {
      await subtasksAPI.updateSubtaskStatus(subtaskId, newStatus);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error("Failed to update subtask status");
    }
  };

  const handleAddAttachment = async (url) => {
    if (!url.trim()) return;
    try {
      const res = await tasksAPI.updateTask(id, {
        attachments: [...(task.attachments || []), url],
      });
      setTask(res.data.data);
      setNewAttachment("");
    } catch (err) {
      toast.error("Failed to add attachment");
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!task) return <div className="text-center py-12">Task not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <TaskHeader
          task={task}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          editData={editData}
          setEditData={setEditData}
          isCreator={isCreator}
          onSave={handleUpdateTask}
          onDelete={handleDeleteTask}
        />

        <div className="p-6">
          <TaskDescription
            isEditing={isEditing}
            editData={editData}
            setEditData={setEditData}
            task={task}
          />

          <TaskDeadline
            isEditing={isEditing}
            editData={editData}
            setEditData={setEditData}
            task={task}
          />

          <TaskMembers
            task={task}
            user={user}
            isCreator={isCreator}
            refresh={() => setRefreshKey((k) => k + 1)}
          />

          <TaskSubtasks
            task={task}
            user={user}
            isCreator={isCreator}
            isAssigned={isAssigned}
            onAdd={handleAddSubtask}
            onUpdateStatus={handleUpdateSubtaskStatus}
          />

          <TaskAttachments
            task={task}
            user={user}
            isCreator={isCreator}
            isAssigned={isAssigned}
            newAttachment={newAttachment}
            setNewAttachment={setNewAttachment}
            onAdd={handleAddAttachment}
          />
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
