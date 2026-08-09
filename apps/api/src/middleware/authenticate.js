import { UnauthorizedError } from "../shared/errors/index.js";
import { verifyAccessToken } from "../config/jwt.js";
import { User } from "../modules/users/user.model.js";

export async function authenticate(req, res, next) {
  try {
    const authorization =
      req.headers.authorization;

    if (
      !authorization ||
      !authorization.startsWith("Bearer ")
    ) {
      throw new UnauthorizedError(
        "Authentication required"
      );
    }

    const token = authorization.substring(7);

    let payload;

    try {
      payload = verifyAccessToken(token);
    } catch {
      throw new UnauthorizedError(
        "Invalid or expired access token"
      );
    }

    const user = await User.findById(payload.sub)
      .populate({
        path: "role",
        populate: {
          path: "permissions",
        },
      });

    if (!user || !user.isActive) {
      throw new UnauthorizedError(
        "User account is unavailable"
      );
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
}