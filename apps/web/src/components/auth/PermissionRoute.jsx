import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

export default function PermissionRoute({
  permission,
  children,
}) {
  const {
    user,
    loading,
    hasPermission,
  } = useAuth();

  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-slate-500">
          Checking permissions...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  if (!hasPermission(permission)) {
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  return children;
}