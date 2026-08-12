import { Router } from "express";

import {
  create,
  list,
  getOne,
  update,
  remove,
} from "./student.controller.js";

import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  authorize("students.view"),
  list
);

router.get(
  "/:id",
  authorize("students.view"),
  getOne
);

router.post(
  "/",
  authorize("students.create"),
  create
);

router.patch(
  "/:id",
  authorize("students.update"),
  update
);

router.delete(
  "/:id",
  authorize("students.delete"),
  remove
);

export default router;