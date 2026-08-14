import { Router } from "express";

import {
  create,
  list,
  getOne,
  update,
  remove,
} from "./subject.controller.js";

import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();

router.use(authenticate);
router.get(
  "/",
  authorize("subjects.view"),
  list
);

router.get(
  "/:id",
  authorize("subjects.view"),
  getOne
);

router.post(
  "/",
  authorize("subjects.create"),
  create
);

router.patch(
  "/:id",
  authorize("subjects.update"),
  update
);

router.delete(
  "/:id",
  authorize("subjects.delete"),
  remove
);

export default router;