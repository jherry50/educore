import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

import {
  listPermissionsController,
} from "./permission.controller.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  authorize("permissions.view"),
  listPermissionsController
);

export default router;