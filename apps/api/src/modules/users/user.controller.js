import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "./user.service.js";

import {
  successResponse,
} from "../../shared/responses/api-response.js";

export async function listUsersController(
  req,
  res,
  next
) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = req.query.search || "";

    const result = await getUsers({
      page,
      limit,
      search,
    });

    return successResponse(res, {
      message: "Users retrieved successfully",
      data: result.users,
      meta: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserController(
  req,
  res,
  next
) {
  try {
    const user = await getUserById(req.params.id);

    return successResponse(res, {
      message: "User retrieved successfully",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

export async function createUserController(
  req,
  res,
  next
) {
  try {
    const user = await createUser(req.body);

    return successResponse(res, {
      statusCode: 201,
      message: "User created successfully",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUserController(
  req,
  res,
  next
) {
  try {
    const user = await updateUser(
      req.params.id,
      req.body
    );

    return successResponse(res, {
      message: "User updated successfully",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteUserController(
  req,
  res,
  next
) {
  try {
    await deleteUser(req.params.id);

    return successResponse(res, {
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}