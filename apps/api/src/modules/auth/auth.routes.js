import { Router } from "express";

import {
  loginController,
  refreshController,
  logoutController,
  meController,
} from "./auth.controller.js";

import { validate } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/authenticate.js";

import {
  loginSchema,
  refreshSchema,
} from "./auth.validation.js";

const router = Router();

router.post(
  "/login",
  validate(loginSchema),
  loginController
);

router.post(
  "/refresh",
  refreshController
);

router.post(
  "/logout",
  authenticate,
  logoutController
);

router.get(
  "/me",
  authenticate,
  meController
);

export default router;