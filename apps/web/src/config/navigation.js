export const navigation = {
  administrator: [
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
      label: "Teacher Assignments",
      path: "/admin/teacher-assignments",
      permission: "teachers.view",
    },
    {
      label: "Parents",
      path: "/admin/parents",
      permission: "parents.view",
    },
    {
      label: "Classes",
      path: "/admin/classes",
      permission: "classes.view",
    },
    {
      label: "Subjects",
      path: "/admin/subjects",
      permission: "subjects.view",
    },
    {
      label: "Attendance",
      path: "/attendance",
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
    // {
    //   label: "Settings",
    //   path: "/admin/settings",
    //   permission: "settings.view",
    // },
  ],

  teacher: [
    {
      label: "Dashboard",
      path: "/teacher",
      permission: "dashboard.view",
    },
    {
      label: "Students",
      path: "/teacher/students",
      permission: "students.view",
    },
     {
      label: "Teachers",
      path: "/teacher/teachers",
      permission: "teachers.view",
    },
    {
      label: "Assignment",
      path: "/teacher/teacher-assignments",
      permission: "teachers.view",
    },
    {
      label: "Classes",
      path: "/teacher/classes",
      permission: "classes.view",
    },
    {
      label: "Attendance",
      path: "/attendance",
      permission: "attendance.view",
    },
    {
      label: "Results",
      path: "/teacher/results",
      permission: "results.view",
    },
  ],

  parent: [
    {
      label: "Dashboard",
      path: "/parent",
      permission: "dashboard.view",
    },
    {
      label: "My Children",
      path: "/parent/children",
      permission: "students.view",
    },
    {
      label: "Attendance",
      path: "/parent/attendance",
      permission: "attendance.view",
    },
    {
      label: "Results",
      path: "/parent/results",
      permission: "results.view",
    },
  ],

  student: [
    {
      label: "Dashboard",
      path: "/student",
      permission: "dashboard.view",
    },
    {
      label: "My Profile",
      path: "/student/profile",
    },
    {
      label: "Attendance",
      path: "/student/attendance",
      permission: "attendance.view",
    },
    {
      label: "Results",
      path: "/student/results",
      permission: "results.view",
    },
  ],
};