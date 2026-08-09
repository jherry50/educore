import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.js";
import userRoutes from "../modules/users/user.routes.js";
import roleRoutes from "../modules/roles/role.routes.js";
import permissionRoutes from "../modules/permissions/permission.routes.js";

import {
  successResponse,
} from "../shared/responses/api-response.js";

const router = Router();

router.get("/health", (req, res) => {
  return successResponse(res, {
    message: "EduCore API is healthy",

    data: {
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  });
});

router.use("/auth", authRoutes);

router.use("/users", userRoutes);

router.use("/roles", roleRoutes);

router.use("/permissions", permissionRoutes);

export default router;