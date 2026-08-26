import {
  NavLink,
} from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

import {
  getUserNavigation,
  getRoleName,
} from "../../utils/navigation";

const roleLabels = {
  administrator: "Administrator",
  teacher: "Teacher",
  parent: "Parent",
  student: "Student",
};

const settingsNavigation = [
  {
    label: "Academic Sessions",
    path: "/admin/academic-sessions",
    permission: "settings.view",
  },
];

const attendanceNavigation = [
  {
    label: "Dashboard",
    path: "/attendance/dashboard",
    permission: "attendance.view",
  },
  {
    label: "Take Attendance",
    path: "/attendance",
    permission: "attendance.view",
  },
  {
    label: "Attendance History",
    path: "/attendance-history",
    permission: "attendance.view",
  },
  {
    label: "Student Attendance",
    path: "/attendance/student",
    permission: "attendance.view",
  },
  {
    label: "Class Attendance",
    path: "/attendance/class",
    permission: "attendance.view",
  },
  {
    label: "Reports",
    path: "/attendance/report",
    permission: "attendance.view",
  },
];

export default function Sidebar() {
  const {
    user,
    logout,
    hasPermission,
  } = useAuth();

  const navigation =
    getUserNavigation(user);

  const visibleSettingsNavigation =
    settingsNavigation.filter((item) =>
      hasPermission(item.permission)
  );

  const visibleAttendanceNavigation =
    attendanceNavigation.filter((item) =>
      hasPermission(item.permission)
  );

  const roleName =
    getRoleName(user);

  const roleLabel =
    roleLabels[roleName] ||
    "User";

  async function handleLogout() {
    await logout();
  }

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">

      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center border-b border-slate-200 px-6">
        <h1 className="text-xl font-bold text-blue-600">
          EduCore
        </h1>
      </div>

      {/* User */}
      <div className="border-b border-slate-200 px-5 py-4">
        <p className="truncate text-sm font-semibold text-slate-900">
          {user?.firstName}{" "}
          {user?.lastName}
        </p>

        <p className="mt-0.5 text-xs text-slate-500">
          {roleLabel}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={
              item.path ===
              `/${roleName}`
            }
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
        ))}

         {/* Attendance */}
        {visibleAttendanceNavigation.length >
          0 && (
          <div className="pt-6">
            <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Attendance
            </p>

            <div className="space-y-1">
              {visibleAttendanceNavigation.map(
                (item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
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
            </div>
          </div>
        )}

         {/* Settings */}
        {visibleSettingsNavigation.length >
          0 && (
          <div className="pt-6">
            <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Settings
            </p>

            <div className="space-y-1">
              {visibleSettingsNavigation.map(
                (item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
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
            </div>
          </div>
        )}
      </nav>

      {/* Logout */}
      <div className="shrink-0 border-t border-slate-200 p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}