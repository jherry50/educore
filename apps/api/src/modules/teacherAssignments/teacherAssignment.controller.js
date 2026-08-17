import {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
} from "./teacherAssignment.service.js";

export async function create(
  req,
  res,
  next
) {
  try {
    const assignment =
      await createAssignment(req.body);

    const populated =
      await getAssignmentById(
        assignment._id
      );

    res.status(201).json({
      success: true,
      message:
        "Teacher assignment created successfully.",
      data: populated,
    });
  } catch (error) {
    if (
      error.code === 11000
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This teacher is already assigned to this subject and class for the selected session and term.",
      });
    }

   if (
        error.message?.includes("not found") ||
        error.message?.includes("inactive") ||
        error.message?.includes("Invalid") ||
        error.message?.includes("completed") ||
        error.message?.includes("does not exist")
    )  {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  
}
}

export async function list(
  req,
  res,
  next
) {
  try {
    const assignments =
      await getAssignments(req.query);

    res.json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    next(error);
  }
}

export async function getOne(
  req,
  res,
  next
) {
  try {
    const assignment =
      await getAssignmentById(
        req.params.id
      );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message:
          "Teacher assignment not found.",
      });
    }

    res.json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
}

export async function update(
  req,
  res,
  next
) {
  try {
    const assignment =
      await updateAssignment(
        req.params.id,
        req.body
      );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message:
          "Teacher assignment not found.",
      });
    }

    res.json({
      success: true,
      message:
        "Teacher assignment updated successfully.",
      data: assignment,
    });
  } catch (error) {
    if (
      error.code === 11000
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This teacher is already assigned to this subject and class for the selected session and term.",
      });
    }

   if (
  error.message?.includes("not found") ||
  error.message?.includes("inactive") ||
  error.message?.includes("Invalid") ||
  error.message?.includes("completed") ||
  error.message?.includes("does not exist")
)  {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  
}
}

export async function remove(
  req,
  res,
  next
) {
  try {
    const assignment =
      await deleteAssignment(
        req.params.id
      );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message:
          "Teacher assignment not found.",
      });
    }

    res.json({
      success: true,
      message:
        "Teacher assignment deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}