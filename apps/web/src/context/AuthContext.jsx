import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  login as loginRequest,
  logout as logoutRequest,
  refreshToken,
  getCurrentUser,
} from "../services/auth.service";

import {
  setAccessToken,
  clearAccessToken,
} from "../services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] =
    useState(true);

  const isAuthenticated = Boolean(user);

  const loadSession = useCallback(
    async () => {
      try {
        const result =
          await refreshToken();

        const token =
          result.data.accessToken;

        setAccessToken(token);

        const userResult =
          await getCurrentUser();

        setUser(
          userResult.data.user
        );
      } catch {
        clearAccessToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const login = useCallback(
    async (credentials) => {
      const result =
        await loginRequest(credentials);

      const token =
        result.data.accessToken;

      setAccessToken(token);

      setUser(result.data.user);

      return result.data.user;
    },
    []
  );

  const logout = useCallback(
    async () => {
      try {
        await logoutRequest();
      } finally {
        clearAccessToken();
        setUser(null);
      }
    },
    []
  );

  const hasPermission = useCallback(
    (permission) => {
      if (!user?.role?.permissions) {
        return false;
      }

      return user.role.permissions.some(
        (item) =>
          item.name === permission
      );
    },
    [user]
  );

  const hasAnyPermission = useCallback(
    (permissions) => {
      return permissions.some(
        hasPermission
      );
    },
    [hasPermission]
  );

  const hasAllPermissions = useCallback(
    (permissions) => {
      return permissions.every(
        hasPermission
      );
    },
    [hasPermission]
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated,

      login,
      logout,

      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
    }),
    [
      user,
      loading,
      isAuthenticated,
      login,
      logout,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}