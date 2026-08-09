import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage.jsx";

import DashboardPage from "../pages/admin/DashboardPage.jsx";
import UsersPage from "../pages/admin/UsersPage.jsx";
import RolesPage from "../pages/admin/RolesPage.jsx";
import PermissionsPage from "../pages/admin/PermissionsPage.jsx";
import UnauthorizedPage from "../pages/admin/UnauthorizedPage.jsx";

import AppLayout from "../components/layout/AppLayout.jsx";

import ProtectedRoute from "./ProtectedRoute.jsx";
import PermissionRoute from "./PermissionRoute.jsx";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route
              path="/admin"
              element={
                <PermissionRoute permission="dashboard.view">
                  <DashboardPage />
                </PermissionRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <PermissionRoute permission="users.view">
                  <UsersPage />
                </PermissionRoute>
              }
            />

            <Route
              path="/admin/roles"
              element={
                <PermissionRoute permission="roles.view">
                  <RolesPage />
                </PermissionRoute>
              }
            />

            <Route
              path="/admin/permissions"
              element={
                <PermissionRoute permission="permissions.view">
                  <PermissionsPage />
                </PermissionRoute>
              }
            />

            <Route
              path="/admin/unauthorized"
              element={
                <UnauthorizedPage />
              }
            />
          </Route>
        </Route>

        <Route
          path="*"
          element={
            <LoginPage />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}