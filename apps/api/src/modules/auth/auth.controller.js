import {
  login,
  logout,
  refreshAccessToken,
  getCurrentUser,
} from "./auth.service.js";

import {
  successResponse,
} from "../../shared/responses/api-response.js";

export async function loginController(
  req,
  res,
  next
) {
  try {
    const result = await login(req.body);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return successResponse(res, {
      message: "Login successful",
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function refreshController(
  req,
  res,
  next
) {
  try {
    const refreshToken =
      req.cookies.refreshToken ||
      req.body.refreshToken;

    const result =
      await refreshAccessToken(refreshToken);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return successResponse(res, {
      message: "Token refreshed successfully",
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function logoutController(
  req,
  res,
  next
) {
  try {
    await logout(req.user._id);

    res.clearCookie("refreshToken");

    return successResponse(res, {
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
}

export async function meController(
  req,
  res,
  next
) {
  try {
    const user = await getCurrentUser(
      req.user._id
    );

    return successResponse(res, {
      message: "Current user retrieved successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
}