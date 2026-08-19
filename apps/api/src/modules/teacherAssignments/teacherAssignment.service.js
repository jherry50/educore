import mongoose from "mongoose";

import { TeacherAssignment } from "./teacherAssignment.model.js";
import { Teacher } from "../teachers/teacher.model.js";
import { Subject } from "../subjects/subject.model.js";
import { SchoolClass as Class } from "../classes/class.model.js";
import { AcademicSession } from "../academicSessions/academicSession.model.js";

async function validateAssignmentEntities(data) {
  const {
    teacher,
    subject,
    class: classId,
    academicSession,
    term,
  } = data;

  // ----------------------------------------
  // Validate IDs
  // ----------------------------------------

  if (
    !mongoose.Types.ObjectId.isValid(teacher)
  ) {
    throw new Error(
      "Invalid teacher ID."
    );
  }

  if (
    !mongoose.Types.ObjectId.isValid(subject)
  ) {
    throw new Error(
      "Invalid subject ID."
    );
  }

  if (
    !mongoose.Types.ObjectId.isValid(classId)
  ) {
    throw new Error(
      "Invalid class ID."
    );
  }

  if (
    !mongoose.Types.ObjectId.isValid(
      academicSession
    )
  ) {
    throw new Error(
      "Invalid academic session ID."
    );
  }

  // ----------------------------------------
  // Validate term
  // ----------------------------------------

  const allowedTerms = [
    "First Term",
    "Second Term",
    "Third Term",
  ];

  if (!allowedTerms.includes(term)) {
    throw new Error(
      "Invalid academic term."
    );
  }

  // ----------------------------------------
  // Fetch entities
  // ----------------------------------------

  const [
    teacherRecord,
    subjectRecord,
    classRecord,
    academicSessionRecord,
  ] = await Promise.all([
    Teacher.findById(teacher),
    Subject.findById(subject),
    Class.findById(classId),
    AcademicSession.findById(
      academicSession
    ),
  ]);

  // ----------------------------------------
  // Teacher
  // ----------------------------------------

  if (!teacherRecord) {
    throw new Error(
      "Teacher not found."
    );
  }

  if (teacherRecord.isActive === false) {
    throw new Error(
      "Cannot assign an inactive teacher."
    );
  }

  // ----------------------------------------
  // Subject
  // ----------------------------------------

  if (!subjectRecord) {
    throw new Error(
      "Subject not found."
    );
  }

  if (subjectRecord.isActive === false) {
    throw new Error(
      "Cannot assign an inactive subject."
    );
  }

  // ----------------------------------------
  // Class
  // ----------------------------------------

  if (!classRecord) {
    throw new Error(
      "Class not found."
    );
  }

  if (classRecord.isActive === false) {
    throw new Error(
      "Cannot assign an inactive class."
    );
  }

  // ----------------------------------------
  // Academic Session
  // ----------------------------------------

  if (!academicSessionRecord) {
    throw new Error(
      "Academic session not found."
    );
  }

  if (
    academicSessionRecord.isCompleted
  ) {
    throw new Error(
      "Cannot create an assignment for a completed academic session."
    );
  }

  // ----------------------------------------
  // Validate term belongs to session
  // ----------------------------------------

  const selectedTerm =
    academicSessionRecord.terms?.find(
      (sessionTerm) =>
        sessionTerm.name === term
    );

  if (!selectedTerm) {
    throw new Error(
      `${term} does not exist in the selected academic session.`
    );
  }

  return {
    teacherRecord,
    subjectRecord,
    classRecord,
    academicSessionRecord,
    selectedTerm,
  };
}

export async function createAssignment(data) {
  await validateAssignmentEntities(data);

  return TeacherAssignment.create({
    teacher: data.teacher,
    subject: data.subject,
    class: data.class,
    academicSession:
      data.academicSession,
    term: data.term,
    isActive:
      data.isActive ?? true,
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
    .populate(
      "academicSession",
      "name startDate endDate isActive isCompleted terms"
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
    )
    .populate(
      "academicSession",
      "name startDate endDate isActive isCompleted terms"
    );
}

export async function updateAssignment(
  id,
  data
) {
  const existing =
    await TeacherAssignment.findById(id);

  if (!existing) {
    return null;
  }

  const mergedData = {
    teacher:
      data.teacher ?? existing.teacher,
    subject:
      data.subject ?? existing.subject,
    class:
      data.class ?? existing.class,
    academicSession:
      data.academicSession ??
      existing.academicSession,
    term:
      data.term ?? existing.term,
    isActive:
      data.isActive ??
      existing.isActive,
  };

  await validateAssignmentEntities(
    mergedData
  );

  Object.assign(existing, mergedData);

  await existing.save();

  return getAssignmentById(id);
}

export async function deleteAssignment(
  id
) {
  return TeacherAssignment.findByIdAndDelete(
    id
  );
}

export async function getTeacherAssignedClasses({
  teacher,
  academicSession,
  term,
}) {
  const filter = {
    teacher,
    isActive: true,
  };

  if (academicSession) {
    filter.academicSession =
      academicSession;
  }

  if (term) {
    filter.term = term;
  }

  const assignments =
    await TeacherAssignment.find(filter)
      .populate(
        "class",
        "name code section level isActive"
      )
      .lean();

  const classes = assignments
    .map(
      (assignment) =>
        assignment.class
    )
    .filter(Boolean)
    .filter(
      (classItem) =>
        classItem.isActive !== false
    );

  /*
   * Remove duplicate classes.
   *
   * A teacher may teach multiple
   * subjects in the same class.
   */
  const uniqueClasses = Array.from(
    new Map(
      classes.map((classItem) => [
        classItem._id.toString(),
        classItem,
      ])
    ).values()
  );

  return uniqueClasses;
}

export async function getMyTeacherAssignments({
  userId,
  academicSession,
  term,
}) {
  const teacher = await Teacher.findOne({
    user: userId,
    isActive: true,
  });

  if (!teacher) {
    throw new Error(
      "Teacher profile not found."
    );
  }

  const filter = {
    teacher: teacher._id,
    isActive: true,
  };

  if (academicSession) {
    filter.academicSession =
      academicSession;
  }

  if (term) {
    filter.term = term;
  }

  return TeacherAssignment.find(filter)
    .populate(
      "class",
      "name code section level isActive"
    )
    .populate(
      "subject",
      "name code"
    )
    .populate(
      "academicSession",
      "name"
    )
    .sort({
      createdAt: -1,
    })
    .lean();
}