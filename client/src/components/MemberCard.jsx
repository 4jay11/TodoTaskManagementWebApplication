import React from "react";
import { Link } from "react-router-dom";

const MemberCard = ({ member }) => {
  if (!member) return null;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center">
        <img
          src={
            member.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              member.name || "User"
            )}&background=random`
          }
          alt={member.name || "User"}
          className="w-12 h-12 rounded-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
              member.name || "User"
            )}&background=random`;
          }}
        />
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {member.name || "Unnamed User"}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {member.email || "No email provided"}
          </p>
        </div>
      </div>

      {member.skills && member.skills.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {member.skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <span>{member.assignedTasks || 0} assigned tasks</span>
        </div>
        <Link
          to={`/profile/${member._id}`}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
};

export default MemberCard;
