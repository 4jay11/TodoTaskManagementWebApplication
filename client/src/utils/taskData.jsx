export const taskData = {
  myTasks: [
    {
      id: 1,
      name: "Redesign Dashboard",
      description:
        "Update UI to match new branding. Improve user navigation flow for easier access.",
      priority: "High",
      status: "In Progress",
      assignedTo: "Ajay",
      startDate: "2025-03-18",
      dueDate: "2025-03-22",
      users: [
        "https://i.pravatar.cc/100?img=12",
        "https://i.pravatar.cc/100?img=14",
        "https://i.pravatar.cc/100?img=17",
      ],
      links: 3,
    },
    {
      id: 2,
      name: "API Integration",
      description:
        "Connect frontend with backend APIs. Ensure secure authentication with tokens.",
      priority: "Medium",
      status: "Completed",
      assignedTo: "Priya",
      startDate: "2025-03-14",
      dueDate: "2025-03-16",
      users: [
        "https://i.pravatar.cc/100?img=15",
        "https://i.pravatar.cc/100?img=21",
      ],
      links: 2,
    },
  ],
  sharedTasks: [
    {
      id: 3,
      name: "Fix Auth Bugs",
      description:
        "Resolve OAuth token mismatch. Test for all social logins and password flow.",
      priority: "Low",
      status: "Pending",
      assignedTo: "Vishal",
      startDate: "2025-03-19",
      dueDate: "2025-03-24",
      users: ["https://i.pravatar.cc/100?img=30"],
      links: 1,
    },
  ],
};
