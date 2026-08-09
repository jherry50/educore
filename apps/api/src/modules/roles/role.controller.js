import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from "./role.service.js";

import {
  successResponse,
} from "../../shared/responses/api-response.js";

export async function listRolesController(
  req,
  res,
  next
) {
  try {
    const roles = await getRoles();

    return successResponse(res, {
      message: "Roles retrieved successfully",
      data: { roles },
    });
  } catch (error) {
    next(error);
  }
}

export async function getRoleController(
  req,
  res,
  next
) {
  try {
    const role = await getRoleById(req.params.id);

    return successResponse(res, {
      message: "Role retrieved successfully",
      data: { role },
    });
  } catch (error) {
    next(error);
  }
}

export async function createRoleController(
  req,
  res,
  next
) {
  try {
    const role = await createRole(req.body);

    return successResponse(res, {
      statusCode: 201,
      message: "Role created successfully",
      data: { role },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateRoleController(
  req,
  res,
  next
) {
  try {
    const role = await updateRole(
      req.params.id,
      req.body
    );

    return successResponse(res, {
      message: "Role updated successfully",
      data: { role },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteRoleController(
  req,
  res,
  next
) {
  try {
    await deleteRole(req.params.id);

    return successResponse(res, {
      message: "Role deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}