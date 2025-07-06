import {
  LuLayoutDashboard,
  LuListTodo,
  LuClipboard,
  LuUsers,
  LuSquarePlus,
  LuLogOut,
} from "react-icons/lu";

export const SIDE_MENU_ITEMS = [
  {
    id: 1,
    label: "Dashboard",
    icon: <LuLayoutDashboard />,
    path: "/dashboard",
  },
  {
    id: 2,
    label: "Manage Tasks",
    icon: <LuListTodo />,
    path: "/manage-tasks",
  },
  {
    id: 3,
    label: "Create Task",
    icon: <LuSquarePlus />,
    path: "/create-task",
  },
  {
    id: 4,
    label: "Members",
    icon: <LuUsers />,
    path: "/members",
  },
  {
    id: 5,
    label: "Logout",
    icon: <LuLogOut />,
    path: "/logout",
  },
];

export const PRIORITY_DATA = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

export const STATUS_DATA = [
  { label: "Pending", value: "pending" },
  { label: "In Progress", value: "inProgress" },
  { label: "Completed", value: "completed" },
];
