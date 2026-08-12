import {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} from "./student.service.js";

export async function create(
  req,
  res,
  next
) {
  try {
    const student =
      await createStudent(req.body);

    res.status(201).json({
      success: true,
      message:
        "Student created successfully.",
      data: student,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Admission number already exists.",
        errors: {
          admissionNumber:
            "This admission number is already in use.",
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
      page = 1,
      limit = 10,
      search = "",
      status,
      classId,
    } = req.query;

    const result =
      await getStudents({
        page: Number(page),
        limit: Number(limit),
        search,
        status,
        classId,
      });

    res.json({
      success: true,
      data: result,
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
    const student =
      await getStudentById(
        req.params.id
      );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    res.json({
      success: true,
      data: student,
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
    const student =
      await updateStudent(
        req.params.id,
        req.body
      );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    res.json({
      success: true,
      message:
        "Student updated successfully.",
      data: student,
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
    const student =
      await deleteStudent(
        req.params.id
      );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    res.json({
      success: true,
      message:
        "Student deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}