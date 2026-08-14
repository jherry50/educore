import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage.jsx";

// import DashboardPage from "../pages/admin/DashboardPage.jsx";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage.jsx";
import StudentsPage from "../pages/admin/StudentsPage.jsx";
import StudentFormPage from "../pages/admin/StudentFormPage.jsx";
import StudentDetailsPage from "../pages/admin/StudentDetailsPage.jsx";
import ClassesPage from "../pages/admin/ClassesPage.jsx";
import ClassFormPage from "../pages/admin/ClassFormPage.jsx";
import TeachersPage from "../pages/admin/TeachersPage.jsx";
import TeacherFormPage from "../pages/admin/TeacherFormPage.jsx";
import TeacherDetailsPage from "../pages/admin/TeacherDetailsPage.jsx";
import TeacherEditPage from "../pages/admin/TeacherEditPage.jsx";
import ClassDetailsPage from "../pages/classes/ClassDetailsPage.jsx";
import SubjectsPage from "../pages/subjects/SubjectsPage.jsx";

import TeacherDashboardPage from "../pages/teacher/TeacherDashboardPage.jsx";
import ParentDashboardPage from "../pages/parent/ParentDashboardPage.jsx";
import StudentDashboardPage from "../pages/student/StudentDashboardPage.jsx";
import UsersPage from "../pages/admin/UsersPage.jsx";
import RolesPage from "../pages/admin/RolesPage.jsx";
import PermissionsPage from "../pages/admin/PermissionsPage.jsx";
import UnauthorizedPage from "../pages/admin/UnauthorizedPage.jsx";

import AppLayout from "../components/layout/AppLayout.jsx";

import ProtectedRoute from "./ProtectedRoute.jsx";
import PermissionRoute from "./PermissionRoute.jsx";
import RoleRoute from "./RoleRoute.jsx";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route
          path="/login"
          element={<LoginPage />}
        />

        {/* AUTHENTICATED APPLICATION */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>

            {/* ========================= */}
            {/* ADMINISTRATOR */}
            {/* ========================= */}

            {/* <Route
              path="/admin"
              element={
                <RoleRoute
                  allowedRoles={[
                    "administrator",
                  ]}
                >
                  <PermissionRoute permission="dashboard.view">
                    <DashboardPage />
                  </PermissionRoute>
                </RoleRoute>
              }
            /> */}

            <Route
                path="/admin"
                element={
                    <RoleRoute allowedRoles={["administrator"]}>
                    <PermissionRoute permission="dashboard.view">
                        <AdminDashboardPage />
                    </PermissionRoute>
                    </RoleRoute>
                }
            />
            <Route
                path="/admin/teachers"
                element={
                    <RoleRoute
                    allowedRoles={[
                        "administrator",
                    ]}
                    >
                    <PermissionRoute permission="teachers.view">
                        <TeachersPage />
                    </PermissionRoute>
                    </RoleRoute>
                }
            />
             <Route
                path="/admin/teachers/new"
                element={
                    <RoleRoute
                    allowedRoles={[
                        "administrator",
                    ]}
                    >
                    <PermissionRoute permission="teachers.create">
                        <TeacherFormPage />
                    </PermissionRoute>
                    </RoleRoute>
                }
            />
            <Route
              path="admin/teachers/:id"
              element={
                <PermissionRoute permission="teachers.view">
                  <TeacherDetailsPage />
                </PermissionRoute>
              }
            />
            <Route
              path="/teachers/:id/edit"
              element={
                <PermissionRoute permission="teachers.update">
                  <TeacherEditPage />
                </PermissionRoute>
              }
            />
            <Route
                path="/admin/students"
                element={
                    <RoleRoute
                    allowedRoles={[
                        "administrator",
                    ]}
                    >
                    <PermissionRoute permission="students.view">
                        <StudentsPage />
                    </PermissionRoute>
                    </RoleRoute>
                }
            />
            <Route
                path="/admin/students/new"
                element={
                    <RoleRoute
                    allowedRoles={[
                        "administrator",
                    ]}
                    >
                    <PermissionRoute permission="students.create">
                        <StudentFormPage />
                    </PermissionRoute>
                    </RoleRoute>
                }
                />

            <Route
                path="/admin/students/:id/edit"
                element={
                    <RoleRoute
                    allowedRoles={[
                        "administrator",
                    ]}
                    >
                    <PermissionRoute permission="students.update">
                        <StudentFormPage />
                    </PermissionRoute>
                    </RoleRoute>
                }
            />

            <Route
                path="/admin/students/:id"
                element={
                    <RoleRoute
                    allowedRoles={[
                        "administrator",
                    ]}
                    >
                    <PermissionRoute permission="students.view">
                        <StudentDetailsPage />
                    </PermissionRoute>
                    </RoleRoute>
                }
            />

            <Route
                path="/admin/classes"
                element={
                    <RoleRoute
                    allowedRoles={[
                        "administrator",
                    ]}
                    >
                    <PermissionRoute permission="classes.view">
                        <ClassesPage />
                    </PermissionRoute>
                    </RoleRoute>
                }
            />

            <Route
                path="/admin/classes/new"
                element={
                    <RoleRoute
                    allowedRoles={[
                        "administrator",
                    ]}
                    >
                    <PermissionRoute permission="classes.create">
                        <ClassFormPage />
                    </PermissionRoute>
                    </RoleRoute>
                }
            />

            <Route
                path="/admin/classes/:id/edit"
                element={
                    <RoleRoute
                    allowedRoles={[
                        "administrator",
                    ]}
                    >
                    <PermissionRoute permission="classes.update">
                        <ClassFormPage />
                    </PermissionRoute>
                    </RoleRoute>
                }
            />

            <Route
              path="/admin/classes/:id"
              element={
                 <RoleRoute
                    allowedRoles={[
                        "administrator",
                    ]}
                    >
                  <PermissionRoute permission="classes.view">
                    <ClassDetailsPage />
                  </PermissionRoute>
                </RoleRoute>
              }
            />

            <Route
              path="/admin/subjects"
              element={
                <PermissionRoute permission="subjects.view">
                  <SubjectsPage />
                </PermissionRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <RoleRoute
                  allowedRoles={[
                    "administrator",
                  ]}
                >
                  <PermissionRoute permission="users.view">
                    <UsersPage />
                  </PermissionRoute>
                </RoleRoute>
              }
            />

            <Route
              path="/admin/roles"
              element={
                <RoleRoute
                  allowedRoles={[
                    "administrator",
                  ]}
                >
                  <PermissionRoute permission="roles.view">
                    <RolesPage />
                  </PermissionRoute>
                </RoleRoute>
              }
            />

            <Route
              path="/admin/permissions"
              element={
                <RoleRoute
                  allowedRoles={[
                    "administrator",
                  ]}
                >
                  <PermissionRoute permission="permissions.view">
                    <PermissionsPage />
                  </PermissionRoute>
                </RoleRoute>
              }
            />

            {/* ========================= */}
            {/* TEACHER */}
            {/* ========================= */}

            <Route
                path="/teacher"
                element={
                    <RoleRoute allowedRoles={["teacher"]}>
                    <PermissionRoute permission="dashboard.view">
                        <TeacherDashboardPage />
                    </PermissionRoute>
                    </RoleRoute>
                }
            />

            <Route
              path="/teacher/teachers"
              element={
                <RoleRoute allowedRoles={["teacher"]}>
                  <PermissionRoute permission="teachers.view">
                    <TeachersPage />
                  </PermissionRoute>
                </RoleRoute>
              }
            />

            {/* <Route
              path="/teachers/:id"
              element={
                <RoleRoute allowedRoles={["teacher"]}>
                  <PermissionRoute permission="teachers.view">
                    <TeacherDetailsPage />
                  </PermissionRoute>
                </RoleRoute>
              }
            /> */}
             <Route
              path="/teacher/classes"
              element={
                <RoleRoute allowedRoles={["teacher"]}>
                  <PermissionRoute permission="classes.view">
                    <ClassesPage/>
                  </PermissionRoute>
                </RoleRoute>
              }
            />

            {/* ========================= */}
            {/* PARENT */}
            {/* ========================= */}

            <Route
                path="/parent"
                element={
                    <RoleRoute allowedRoles={["parent"]}>
                    <PermissionRoute permission="dashboard.view">
                        <ParentDashboardPage />
                    </PermissionRoute>
                    </RoleRoute>
                }
            />

            {/* ========================= */}
            {/* STUDENT */}
            {/* ========================= */}

            <Route
                path="/student"
                element={
                    <RoleRoute allowedRoles={["student"]}>
                    <PermissionRoute permission="dashboard.view">
                        <StudentDashboardPage />
                    </PermissionRoute>
                    </RoleRoute>
                }
            />

            {/* ========================= */}
            {/* UNAUTHORIZED */}
            {/* ========================= */}

            <Route
              path="/unauthorized"
              element={
                <UnauthorizedPage />
              }
            />

          </Route>
        </Route>

        {/* UNKNOWN ROUTES */}
        <Route
          path="*"
          element={<LoginPage />}
        />

      </Routes>
    </BrowserRouter>
  );
}