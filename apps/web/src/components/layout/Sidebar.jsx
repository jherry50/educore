import {
  NavLink,
} from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

const navigation = [
  {
    label: "Dashboard",
    path: "/admin",
    permission: "dashboard.view",
  },

  {
    label: "Students",
    path: "/admin/students",
    permission: "students.view",
  },

  {
    label: "Teachers",
    path: "/admin/teachers",
    permission: "teachers.view",
  },

  {
    label: "Attendance",
    path: "/admin/attendance",
    permission: "attendance.view",
  },

  {
    label: "Results",
    path: "/admin/results",
    permission: "results.view",
  },

  {
    label: "Finance",
    path: "/admin/finance",
    permission: "finance.view",
  },

  {
    label: "Reports",
    path: "/admin/reports",
    permission: "reports.view",
  },

  {
    label: "Users",
    path: "/admin/users",
    permission: "users.view",
  },

  {
    label: "Roles",
    path: "/admin/roles",
    permission: "roles.view",
  },

  {
    label: "Permissions",
    path: "/admin/permissions",
    permission: "permissions.view",
  },
];

export default function Sidebar() {
  const { hasPermission } =
    useAuth();

  const visibleNavigation =
    navigation.filter((item) =>
      hasPermission(item.permission)
    );

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold text-blue-600">
          EduCore
        </h1>
      </div>

      <nav className="space-y-1 p-4">
        {visibleNavigation.map(
          (item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                [
                  "block rounded-lg px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          )
        )}
      </nav>
    </aside>
  );
}