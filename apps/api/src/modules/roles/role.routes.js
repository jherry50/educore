import { Router } from "express";

import {
  listRolesController,
  getRoleController,
  createRoleController,
  updateRoleController,
  deleteRoleController,
} from "./role.controller.js";

import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";

import {
  createRoleSchema,
  updateRoleSchema,
} from "./role.validation.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  authorize("roles.view"),
  listRolesController
);

router.get(
  "/:id",
  authorize("roles.view"),
  getRoleController
);

router.post(
  "/",
  authorize("roles.create"),
  validate(createRoleSchema),
  createRoleController
);

router.patch(
  "/:id",
  authorize("roles.update"),
  validate(updateRoleSchema),
  updateRoleController
);

router.delete(
  "/:id",
  authorize("roles.delete"),
  deleteRoleController
);

export default router;