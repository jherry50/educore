import { TeacherAssignment } from "./teacherAssignment.model.js";

export async function createAssignment(data) {
  return TeacherAssignment.create({
    teacher: data.teacher,
    subject: data.subject,
    class: data.class,
    academicSession: data.academicSession,
    term: data.term,
    isActive: data.isActive ?? true,
  });
}

export async function getAssignments(
  query = {}
) {
  const filter = {};

  if (query.teacher) {
    filter.teacher = query.teacher;
  }

  if (query.subject) {
    filter.subject = query.subject;
  }

  if (query.class) {
    filter.class = query.class;
  }

  if (query.academicSession) {
    filter.academicSession =
      query.academicSession;
  }

  if (query.term) {
    filter.term = query.term;
  }

  if (
    query.isActive !== undefined &&
    query.isActive !== ""
  ) {
    filter.isActive =
      query.isActive === true ||
      query.isActive === "true";
  }

  return TeacherAssignment.find(filter)
    .populate({
      path: "teacher",
      populate: {
        path: "user",
        select:
          "firstName lastName email",
      },
    })
    .populate(
      "subject",
      "name code section isCore"
    )
    .populate(
      "class",
      "name code section level"
    )
    .sort({
      createdAt: -1,
    });
}

export async function getAssignmentById(
  id
) {
  return TeacherAssignment.findById(id)
    .populate({
      path: "teacher",
      populate: {
        path: "user",
        select:
          "firstName lastName email",
      },
    })
    .populate(
      "subject",
      "name code section isCore"
    )
    .populate(
      "class",
      "name code section level"
    );
}

export async function updateAssignment(
  id,
  data
) {
  return TeacherAssignment.findByIdAndUpdate(
    id,
    {
      $set: data,
    },
    {
      new: true,
      runValidators: true,
    }
  )
    .populate({
      path: "teacher",
      populate: {
        path: "user",
        select:
          "firstName lastName email",
      },
    })
    .populate(
      "subject",
      "name code section isCore"
    )
    .populate(
      "class",
      "name code section level"
    );
}

export async function deleteAssignment(
  id
) {
  return TeacherAssignment.findByIdAndDelete(
    id
  );
}