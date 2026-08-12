import { navigation } from "../config/navigation";

export function getRoleName(user) {
  if (!user?.role) {
    return null;
  }

  if (typeof user.role === "string") {
    return user.role.toLowerCase();
  }

  return user.role.name?.toLowerCase() || null;
}

export function getUserNavigation(user) {
  const roleName = getRoleName(user);

  if (!roleName) {
    return [];
  }

  const roleNavigation =
    navigation[roleName] || [];

  const permissions =
    user.role?.permissions || [];

  return roleNavigation.filter(
    (item) => {
      // Items without a permission
      // are available to the role.
      if (!item.permission) {
        return true;
      }

      return permissions.some(
        (permission) =>
          permission.name ===
          item.permission
      );
    }
  );
}