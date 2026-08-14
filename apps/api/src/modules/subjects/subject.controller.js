import {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
} from "./subject.service.js";

export async function create(
  req,
  res,
  next
) {
  try {
    const subject =
      await createSubject(req.body);

    res.status(201).json({
      success: true,
      message: "Subject created successfully.",
      data: subject,
    });
  } catch (error) {
    next(error);
  }
}

export async function list(
  req,
  res,
  next
) {
  try {
    const subjects =
      await getSubjects(req.query);

    res.json({
      success: true,
      data: subjects,
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
    const subject =
      await getSubjectById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found.",
      });
    }

    res.json({
      success: true,
      data: subject,
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
    const subject =
      await updateSubject(
        req.params.id,
        req.body
      );

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found.",
      });
    }

    res.json({
      success: true,
      message: "Subject updated successfully.",
      data: subject,
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
    const subject =
      await deleteSubject(
        req.params.id
      );

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found.",
      });
    }

    res.json({
      success: true,
      message: "Subject deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}