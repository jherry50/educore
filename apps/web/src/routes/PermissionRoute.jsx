import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

export default function PermissionRoute({
  permission,
  children,
}) {
  const { hasPermission } =
    useAuth();

  if (!hasPermission(permission)) {
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  return children || <Outlet />;
}