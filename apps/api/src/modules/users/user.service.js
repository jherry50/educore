import bcrypt from "bcrypt";

import { User } from "./user.model.js";
import { Role } from "../roles/role.model.js";

import {
  ConflictError,
  NotFoundError,
} from "../../shared/errors/index.js";

function sanitizeUser(user) {
  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function getUsers({
  page = 1,
  limit = 20,
  search = "",
}) {
  const skip = (page - 1) * limit;

  const filter = {};

  if (search) {
    filter.$or = [
      {
        firstName: {
          $regex: search,
          $options: "i",
        },
      },
      {
        lastName: {
          $regex: search,
          $options: "i",
        },
      },
      {
        email: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .populate("role", "name description")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    User.countDocuments(filter),
  ]);

  return {
    users: users.map(sanitizeUser),

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getUserById(id) {
  const user = await User.findById(id).populate(
    "role",
    "name description permissions"
  );

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return sanitizeUser(user);
}

export async function createUser(data) {
  const existingUser = await User.findOne({
    email: data.email,
  });

  if (existingUser) {
    throw new ConflictError(
      "A user with this email already exists."
    );
  }

  const role = await Role.findById(data.role);

  if (!role) {
    throw new NotFoundError("Role not found");
  }

  const password = await bcrypt.hash(
    data.password,
    12
  );

  const user = await User.create({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    password,
    role: role._id,
    isActive: data.isActive ?? true,
  });

  await user.populate("role", "name description");

  return sanitizeUser(user);
}

export async function updateUser(id, data) {
  const user = await User.findById(id);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (data.email && data.email !== user.email) {
    const existingUser = await User.findOne({
      email: data.email,
      _id: { $ne: id },
    });

    if (existingUser) {
      throw new ConflictError(
        "A user with this email already exists."
      );
    }
  }

  if (data.role) {
    const role = await Role.findById(data.role);

    if (!role) {
      throw new NotFoundError("Role not found");
    }
  }

//   Object.assign(user, data);
    if (data.firstName !== undefined) {
    user.firstName = data.firstName;
    }

    if (data.lastName !== undefined) {
    user.lastName = data.lastName;
    }

    if (data.email !== undefined) {
    user.email = data.email;
    }

    if (data.phone !== undefined) {
    user.phone = data.phone;
    }

    if (data.role !== undefined) {
    user.role = data.role;
    }

    if (data.isActive !== undefined) {
    user.isActive = data.isActive;
    }

  await user.save();

  await user.populate("role", "name description");

  return sanitizeUser(user);
}

export async function deleteUser(
  id,
  requestingUserId
) {
  if (id === requestingUserId) {
    throw new ConflictError(
      "You cannot delete your own account."
    );
  }

  const user = await User.findById(id);

  if (!user) {
    throw new NotFoundError(
      "User not found"
    );
  }

  await user.deleteOne();
}