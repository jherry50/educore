export const ROLE_ROUTES = {
  administrator: "/admin",
  teacher: "/teacher",
  parent: "/parent",
  student: "/student",
};

export function getRoleName(user) {
  const role = user?.role;

  if (!role) {
    return null;
  }

  if (typeof role === "string") {
    return role.trim().toLowerCase();
  }

  return role.name?.trim().toLowerCase() || null;
}

export function getDefaultRoute(user) {
  const roleName = getRoleName(user);

  return ROLE_ROUTES[roleName] || "/unauthorized";
}

export function canAccessRoleArea(
  user,
  pathname
) {
  const roleName = getRoleName(user);

  if (!roleName || !pathname) {
    return false;
  }

  const expectedRoute =
    ROLE_ROUTES[roleName];

  if (!expectedRoute) {
    return false;
  }

  return (
    pathname === expectedRoute ||
    pathname.startsWith(
      `${expectedRoute}/`
    )
  );
}