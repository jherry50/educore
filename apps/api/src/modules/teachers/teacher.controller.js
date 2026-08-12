import {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "./teacher.service.js";

export async function list(
  req,
  res,
  next
) {
  try {
    const {
      search = "",
      department,
      employmentStatus,
    } = req.query;

    const teachers =
      await getTeachers({
        search,
        department,
        employmentStatus,
      });

    res.json({
      success: true,
      data: teachers,
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
    const teacher =
      await getTeacherById(
        req.params.id
      );

    res.json({
      success: true,
      data: teacher,
    });
  } catch (error) {
    next(error);
  }
}

export async function create(
  req,
  res,
  next
) {
  try {
    const teacher =
      await createTeacher(
        req.body
      );

    res.status(201).json({
      success: true,
      message:
        "Teacher created successfully.",
      data: teacher,
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
    const teacher =
      await updateTeacher(
        req.params.id,
        req.body
      );

    res.json({
      success: true,
      message:
        "Teacher updated successfully.",
      data: teacher,
    });
  } catch (error) {
    next(error);
  }
}

export async function remove(
  req,
  res,
  next
) {
  try {
    await deleteTeacher(
      req.params.id
    );

    res.json({
      success: true,
      message:
        "Teacher deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}