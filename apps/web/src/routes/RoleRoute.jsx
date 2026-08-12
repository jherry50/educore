import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import {
  getRoleName,
} from "../utils/roleRoutes";

export default function RoleRoute({
  allowedRoles,
  children,
}) {
  const {
    user,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">
          Loading...
        </p>
      </div>
    );
  }

  const roleName =
    getRoleName(user);

  const normalizedRoles =
    allowedRoles.map((role) =>
      role.toLowerCase()
    );

  if (
    !roleName ||
    !normalizedRoles.includes(roleName)
  ) {
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  return children || <Outlet />;
}