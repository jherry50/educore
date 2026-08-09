import { ForbiddenError } from "../shared/errors/index.js";

export function authorize(...requiredPermissions) {
  return (req, res, next) => {
    const user = req.user;

    if (!user?.role) {
      return next(
        new ForbiddenError(
          "You do not have a role assigned."
        )
      );
    }

    const permissions =
      user.role.permissions || [];

    const permissionNames = new Set(
      permissions.map(
        (permission) => permission.name
      )
    );

    const hasPermission =
      requiredPermissions.every(
        (permission) =>
          permissionNames.has(permission)
      );

    if (!hasPermission) {
      return next(
        new ForbiddenError(
          "You do not have permission to perform this action."
        )
      );
    }

    next();
  };
}