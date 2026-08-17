import express from "express";

import {
  createAttendanceController,
  deleteAttendanceController,
  getAttendanceByIdController,
  getAttendanceController,
  saveBulkAttendanceController,
  updateAttendanceController,
} from "./attendance.controller.js";

import { protect } from "../../middleware/auth.middleware.js";
import { requirePermission } from "../../middleware/permission.middleware.js";

const router = express.Router();

router.use(protect);

/*
 * View attendance
 */
router.get(
  "/",
  requirePermission("attendance", "view"),
  getAttendanceController
);

/*
 * View one attendance record
 */
router.get(
  "/:id",
  requirePermission("attendance", "view"),
  getAttendanceByIdController
);

/*
 * Create one attendance record
 */
router.post(
  "/",
  requirePermission("attendance", "create"),
  createAttendanceController
);

/*
 * Create/update attendance
 * for an entire class
 */
router.post(
  "/bulk",
  requirePermission("attendance", "create"),
  saveBulkAttendanceController
);

/*
 * Update attendance
 */
router.patch(
  "/:id",
  requirePermission("attendance", "update"),
  updateAttendanceController
);

/*
 * Delete attendance
 */
router.delete(
  "/:id",
  requirePermission("attendance", "delete"),
  deleteAttendanceController
);

export default router;