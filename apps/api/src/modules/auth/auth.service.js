import bcrypt from "bcrypt";
import crypto from "crypto";

import { User } from "../users/user.model.js";
import { Role } from "../roles/role.model.js";

import {
  UnauthorizedError,
  ConflictError,
} from "../../shared/errors/index.js";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../config/jwt.js";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

function hashToken(token) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

function sanitizeUser(user) {
  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role
      ? {
          id: user.role._id,
          name: user.role.name,
          permissions: user.role.permissions,
        }
      : null,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
}

export async function login({ email, password }) {
  const user = await User.findOne({
    email: email.toLowerCase(),
  })
    .select("+password +refreshTokenHash")
    .populate({
      path: "role",
      populate: {
        path: "permissions",
      },
    });

  if (!user) {
    throw new UnauthorizedError(
      "Invalid email or password"
    );
  }

  if (user.isLocked()) {
    throw new UnauthorizedError(
      "Account temporarily locked. Please try again later."
    );
  }

  if (!user.isActive) {
    throw new UnauthorizedError(
      "Your account has been deactivated."
    );
  }

  const passwordMatches =
    await user.comparePassword(password);

  if (!passwordMatches) {
    user.failedLoginAttempts += 1;

    if (
      user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS
    ) {
      user.lockedUntil = new Date(
        Date.now() + LOCK_DURATION_MS
      );
      user.failedLoginAttempts = 0;
    }

    await user.save();

    throw new UnauthorizedError(
      "Invalid email or password"
    );
  }

  user.failedLoginAttempts = 0;
  user.lockedUntil = null;
  user.lastLoginAt = new Date();

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshTokenHash = hashToken(refreshToken);

  await user.save();

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
}

export async function refreshAccessToken(refreshToken) {
  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new UnauthorizedError(
      "Invalid or expired refresh token"
    );
  }

  const user = await User.findById(payload.sub)
    .select("+refreshTokenHash")
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

  const tokenHash = hashToken(refreshToken);

  if (user.refreshTokenHash !== tokenHash) {
    throw new UnauthorizedError(
      "Refresh token has been revoked"
    );
  }

  const accessToken = generateAccessToken(user);
  const newRefreshToken =
    generateRefreshToken(user);

  user.refreshTokenHash =
    hashToken(newRefreshToken);

  await user.save();

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken: newRefreshToken,
  };
}

export async function logout(userId) {
  await User.findByIdAndUpdate(userId, {
    $unset: {
      refreshTokenHash: 1,
    },
  });
}

export async function getCurrentUser(userId) {
  const user = await User.findById(userId).populate({
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

  return sanitizeUser(user);
}