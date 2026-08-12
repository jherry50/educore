export function hasPermission(user, permission) {
  if (!user || !permission) {
    return false;
  }

  const permissions =
    user.role?.permissions || [];

  return permissions.some(
    (item) =>
      typeof item === "string"
        ? item === permission
        : item.name === permission
  );
}

export function hasAnyPermission(
  user,
  permissions = []
) {
  return permissions.some((permission) =>
    hasPermission(user, permission)
  );
}

export function hasAllPermissions(
  user,
  permissions = []
) {
  return permissions.every((permission) =>
    hasPermission(user, permission)
  );
}