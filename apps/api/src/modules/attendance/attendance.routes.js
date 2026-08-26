import { Router } from "express";

import {
  createAttendanceController,
  deleteAttendanceController,
  getAttendanceByIdController,
  getAttendanceController,
  saveBulkAttendanceController,
  updateAttendanceController,
  getStudentAttendanceStatisticsController,
  getClassAttendanceStatisticsController,
  getAttendanceDashboardController,
  getAttendanceReportController,
  exportAttendanceExcelController,
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
 * View attendance dashboard
 */
router.get(
  "/dashboard",
  authorize("attendance.view"),
  getAttendanceDashboardController
);

/*
 * View attendance report
 */
router.get(
  "/reports",
  authorize("attendance.view"),
  getAttendanceReportController
);

/*
 * export attendance report
 */
router.get(
  "/reports/export/excel",
  authorize("attendance.view"),
  exportAttendanceExcelController
);



/*
 * View student attendance statistics
 */
router.get(
  "/statistics/student/:studentId",
  authorize("attendance.view"),
  getStudentAttendanceStatisticsController
);

/*
 * View class attendance statistics
 */
router.get(
  "/statistics/class/:classId",
  authorize("attendance.view"),
  getClassAttendanceStatisticsController
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