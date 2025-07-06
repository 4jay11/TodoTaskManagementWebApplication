import React from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const statusColors = {
  completed:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  "in-progress":
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  pending:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  overdue: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const priorityColors = {
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
};

const TaskCard = ({ task }) => {
  // Format deadline date
  const formattedDeadline = task.deadline
    ? format(new Date(task.deadline), "MMM dd, yyyy")
    : "No deadline";

  // Calculate progress based on subtasks
  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks =
    task.subtasks?.filter((subtask) => subtask.status === "completed").length ||
    0;
  const progress =
    totalSubtasks > 0
      ? Math.round((completedSubtasks / totalSubtasks) * 100)
      : 0;

  return (
    <Link to={`/task/${task._id}`} className="block">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {task.title}
            </h3>
            {task.description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                statusColors[task.status]
              }`}
            >
              {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </span>
            {task.priority && (
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  priorityColors[task.priority]
                }`}
              >
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            )}
          </div>
        </div>

        {/* Progress bar for subtasks */}
        {totalSubtasks > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600 dark:text-gray-300">Progress</span>
              <span className="text-gray-700 dark:text-gray-200 font-medium">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="mt-3 flex justify-between items-center text-sm">
          <div className="text-gray-600 dark:text-gray-400">
            <span>Due: {formattedDeadline}</span>
          </div>
          {task.assignedMembers && task.assignedMembers.length > 0 && (
            <div className="flex -space-x-2">
              {task.assignedMembers.slice(0, 3).map((member, index) => (
                <img
                  key={index}
                  className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800"
                  src={
                    member.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      member.name
                    )}&background=random`
                  }
                  alt={member.name}
                  title={member.name}
                />
              ))}
              {task.assignedMembers.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-800 dark:text-gray-200 border-2 border-white dark:border-gray-800">
                  +{task.assignedMembers.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default TaskCard;
