import { Router } from "express";

import {
  list,
  getOne,
  create,
  update,
  remove,
} from "./teacher.controller.js";

import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  authorize("teachers.view"),
  list
);

router.get(
  "/:id",
  authorize("teachers.view"),
  getOne
);

router.post(
  "/",
  authorize("teachers.create"),
  create
);

router.patch(
  "/:id",
  authorize("teachers.update"),
  update
);

router.delete(
  "/:id",
  authorize("teachers.delete"),
  remove
);

export default router;