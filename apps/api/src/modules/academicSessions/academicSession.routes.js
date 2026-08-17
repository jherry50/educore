import { Router } from "express";

import {
  create,
  list,
  getOne,
  update,
  activate,
  complete,
  remove,
} from "./academicSession.controller.js";

import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();
router.use(authenticate);

router.get(
  "/",
  authorize("settings.view"),
  list
);

router.get(
  "/:id",
  authorize("settings.view"),
  getOne
);

router.post(
  "/",
  authorize("settings.update"),
  create
);

router.patch(
  "/:id",
  authorize("settings.update"),
  update
);

router.patch(
  "/:id/activate",
  authorize("settings.update"),
  activate
);

router.patch(
  "/:id/complete",
  authorize("settings.update"),
  complete
);

router.delete(
  "/:id",
  authorize("settings.update"),
  remove
);

export default router;