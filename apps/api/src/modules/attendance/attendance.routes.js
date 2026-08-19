import { Router } from "express";

import {
  createAttendanceController,
  deleteAttendanceController,
  getAttendanceByIdController,
  getAttendanceController,
  saveBulkAttendanceController,
  updateAttendanceController,
} from "./attendance.controller.js";

import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();
router.use(authenticate);
/*
 * View attendance
 */
router.get(
  "/",
  authorize("attendance.view"),
  getAttendanceController
);

/*
 * View one attendance record
 */
router.get(
  "/:id",
  authorize("attendance.view"),
  getAttendanceByIdController
);

/*
 * Create one attendance record
 */
router.post(
  "/",
  authorize("attendance.create"),
  createAttendanceController
);

/*
 * Create/update attendance
 * for an entire class
 */
router.post(
  "/bulk",
  authorize("attendance.create"),
  saveBulkAttendanceController
);

/*
 * Update attendance
 */
router.patch(
  "/:id",
  authorize("attendance.update"),
  updateAttendanceController
);

/*
 * Delete attendance
 */
router.delete(
  "/:id",
  authorize("attendance.delete"),
  deleteAttendanceController
);

export default router;