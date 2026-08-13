import {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass,
  assignClassTeacher,
} from "./class.service.js";

export async function create(
  req,
  res,
  next
) {
  try {
    const schoolClass =
      await createClass(req.body);

    res.status(201).json({
      success: true,
      message:
        "Class created successfully.",
      data: schoolClass,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Class code already exists.",
        errors: {
          code:
            "This class code is already in use.",
        },
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
    const {
      search = "",
      section,
      isActive,
    } = req.query;

    const classes =
      await getClasses({
        search,
        section,
        isActive,
      });

    res.json({
      success: true,
      data: classes,
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
    const schoolClass =
      await getClassById(
        req.params.id
      );

    if (!schoolClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found.",
      });
    }

    res.json({
      success: true,
      data: schoolClass,
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
    const schoolClass =
      await updateClass(
        req.params.id,
        req.body
      );

    if (!schoolClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found.",
      });
    }

    res.json({
      success: true,
      message:
        "Class updated successfully.",
      data: schoolClass,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Class code already exists.",
        errors: {
          code:
            "This class code is already in use.",
        },
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
    const schoolClass =
      await deleteClass(
        req.params.id
      );

    if (!schoolClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found.",
      });
    }

    res.json({
      success: true,
      message:
        "Class deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}

export async function assignTeacher(
  req,
  res,
  next
) {
  try {
    const schoolClass =
      await assignClassTeacher(
        req.params.id,
        req.body.teacherId
      );

    if (!schoolClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found.",
      });
    }

    res.json({
      success: true,
      message:
        "Class teacher assigned successfully.",
      data: schoolClass,
    });
  } catch (error) {
    next(error);
  }
}