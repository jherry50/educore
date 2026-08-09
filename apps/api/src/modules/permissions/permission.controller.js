import { Permission } from "./permission.model.js";

import {
  successResponse,
} from "../../shared/responses/api-response.js";

export async function listPermissionsController(
  req,
  res,
  next
) {
  try {
    const permissions =
      await Permission.find()
        .sort({
          resource: 1,
          action: 1,
        });

    return successResponse(res, {
      message: "Permissions retrieved successfully",
      data: { permissions },
    });
  } catch (error) {
    next(error);
  }
}