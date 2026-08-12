import { Router } from "express";

import {
  create,
  list,
  getOne,
  update,
  remove,
} from "./class.controller.js";

import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  authorize("classes.view"),
  list
);

router.get(
  "/:id",
  authorize("classes.view"),
  getOne
);

router.post(
  "/",
  authorize("classes.create"),
  create
);

router.patch(
  "/:id",
  authorize("classes.update"),
  update
);

router.delete(
  "/:id",
  authorize("classes.delete"),
  remove
);

export default router;