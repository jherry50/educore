import { Router } from "express";

import {
  listUsersController,
  getUserController,
  createUserController,
  updateUserController,
  deleteUserController,
} from "./user.controller.js";

import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";

import {
  createUserSchema,
  updateUserSchema,
} from "./user.validation.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  authorize("users.view"),
  listUsersController
);

router.get(
  "/:id",
  authorize("users.view"),
  getUserController
);

router.post(
  "/",
  authorize("users.create"),
  validate(createUserSchema),
  createUserController
);

router.patch(
  "/:id",
  authorize("users.update"),
  validate(updateUserSchema),
  updateUserController
);

router.delete(
  "/:id",
  authorize("users.delete"),
  deleteUserController
);

export default router;