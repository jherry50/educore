import { Router } from "express";

import {
  create,
  list,
  getOne,
  update,
  remove,
  getMyTeacherAssignmentsController,
} from "./teacherAssignment.controller.js";

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
  "/my-assignments",
  authorize("teachers.view"),
  getMyTeacherAssignmentsController
);

router.get(
  "/:id",
  authorize("teachers.view"),
  getOne
);

router.post(
  "/",
  authorize("teachers.update"),
  create
);

router.patch(
  "/:id",
  authorize("teachers.update"),
  update
);

router.delete(
  "/:id",
  authorize("teachers.update"),
  remove
);

export default router;