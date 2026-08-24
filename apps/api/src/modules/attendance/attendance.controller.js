import {
  createAttendance,
  deleteAttendance,
  getAttendance,
  getAttendanceById,
  saveBulkAttendance,
  updateAttendance,
  getStudentAttendanceStatistics,
} from "./attendance.service.js";

/**
 * POST /api/attendance
 *
 * Create a single attendance record.
 */
export async function createAttendanceController(
  req,
  res
) {
  try {
    const attendance =
      await createAttendance(
        req.body,
        req.user._id,
        req.user.role.name
      );

    return res.status(201).json({
      success: true,
      message:
        "Attendance recorded successfully.",
      data: attendance,
    });
  } catch (error) {
    console.error(
      "Create attendance error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Unable to record attendance.",
    });
  }
}

/**
 * POST /api/attendance/bulk
 *
 * Create/update attendance for
 * multiple students.
 */
export async function saveBulkAttendanceController(
  req,
  res
) {
  try {
    const result =
      await saveBulkAttendance(
        req.body,
        req.user._id,
        req.user.role.name
      );

    return res.status(200).json({
      success: true,
      message:
        "Attendance saved successfully.",
      data: result,
    });
  } catch (error) {
    console.error(
      "Bulk attendance error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Unable to save attendance.",
    });
  }
}

/**
 * GET /api/attendance
 *
 * Get attendance records.
 */
export async function getAttendanceController(
  req,
  res
) {
  try {
    const attendance =
      await getAttendance({
        student:
          req.query.student,

        class:
          req.query.class,

        academicSession:
          req.query.academicSession,

        term:
          req.query.term,

        status:
          req.query.status,

        date:
          req.query.date,

        startDate:
          req.query.startDate,

        endDate:
          req.query.endDate,
      }, 
      req.user._id,
      req.user.role.name
    );

    return res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    console.error(
      "Get attendance error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Unable to fetch attendance.",
    });
  }
}

/**
 * GET /api/statistics/student/:studentId"
 *
 * Get attendance statistics for a specific student.
 */
export async function getStudentAttendanceStatisticsController(
  req,
  res
) {
  try {
    const {
      studentId,
    } = req.params;

    const result =
      await getStudentAttendanceStatistics(
        studentId,
        {
          academicSession:
            req.query.academicSession,

          term:
            req.query.term,

          startDate:
            req.query.startDate,

          endDate:
            req.query.endDate,
        },
        req.user._id,
        req.user.role.name
      );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(
      "Get student attendance statistics error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Unable to retrieve student attendance statistics.",
    });
  }
}

/**
 * GET /api/attendance/:id
 *
 * Get one attendance record.
 */
export async function getAttendanceByIdController(
  req,
  res
) {
  try {
    const attendance =
      await getAttendanceById(
        req.params.id
      );

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message:
          "Attendance record not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    console.error(
      "Get attendance by ID error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Unable to fetch attendance.",
    });
  }
}

/**
 * PATCH /api/attendance/:id
 *
 * Update one attendance record.
 */
export async function updateAttendanceController(
  req,
  res
) {
  try {
    const attendance =
      await updateAttendance(
        req.params.id,
        req.body,
        req.user._id,
        req.user.role.name
      );

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message:
          "Attendance record not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Attendance updated successfully.",
      data: attendance,
    });
  } catch (error) {
    console.error(
      "Update attendance error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Unable to update attendance.",
    });
  }
}

/**
 * DELETE /api/attendance/:id
 *
 * Delete one attendance record.
 */
export async function deleteAttendanceController(
  req,
  res
) {
  try {
    const attendance =
      await deleteAttendance(
        req.params.id
      );

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message:
          "Attendance record not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Attendance deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete attendance error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Unable to delete attendance.",
    });
  }
}