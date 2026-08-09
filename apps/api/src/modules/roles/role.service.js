import { Role } from "./role.model.js";
import { Permission } from "../permissions/permission.model.js";

import {
  ConflictError,
  NotFoundError,
} from "../../shared/errors/index.js";

export async function getRoles() {
  return Role.find()
    .populate("permissions")
    .sort({ name: 1 });
}

export async function getRoleById(id) {
  const role = await Role.findById(id).populate(
    "permissions"
  );

  if (!role) {
    throw new NotFoundError("Role not found");
  }

  return role;
}

export async function createRole(data) {
  const existingRole = await Role.findOne({
    name: data.name,
  });

  if (existingRole) {
    throw new ConflictError(
      "A role with this name already exists."
    );
  }

  const permissions =
    await Permission.find({
      _id: {
        $in: data.permissions || [],
      },
    });

  const role = await Role.create({
    name: data.name,
    description: data.description,
    permissions: permissions.map(
      (permission) => permission._id
    ),
    isActive: data.isActive ?? true,
    isSystem: false,
  });

  return role.populate("permissions");
}

export async function updateRole(id, data) {
  const role = await Role.findById(id);

  if (!role) {
    throw new NotFoundError("Role not found");
  }

  if (role.isSystem && data.name) {
    throw new ConflictError(
      "System role name cannot be changed."
    );
  }

  if (data.name && data.name !== role.name) {
    const existingRole = await Role.findOne({
      name: data.name,
      _id: { $ne: id },
    });

    if (existingRole) {
      throw new ConflictError(
        "A role with this name already exists."
      );
    }
  }

  if (data.name !== undefined) {
    role.name = data.name;
  }

  if (data.description !== undefined) {
    role.description = data.description;
  }

  if (data.isActive !== undefined) {
    role.isActive = data.isActive;
  }

  if (data.permissions !== undefined) {
    const permissions =
      await Permission.find({
        _id: {
          $in: data.permissions,
        },
      });

    role.permissions = permissions.map(
      (permission) => permission._id
    );
  }

  await role.save();

  return role.populate("permissions");
}

export async function deleteRole(id) {
  const role = await Role.findById(id);

  if (!role) {
    throw new NotFoundError("Role not found");
  }

  if (role.isSystem) {
    throw new ConflictError(
      "System roles cannot be deleted."
    );
  }

  await role.deleteOne();
}