import mongoose from "mongoose";

import { Attendance } from "./attendance.model.js";
import { Student } from "../students/student.model.js";
import { SchoolClass as Class } from "../classes/class.model.js";
import {
  AcademicSession,
} from "../academicSessions/academicSession.model.js";
import { Teacher } from "../teachers/teacher.model.js";
import {
  TeacherAssignment,
} from "../teacherAssignments/teacherAssignment.model.js";

const ALLOWED_TERMS = [
  "First Term",
  "Second Term",
  "Third Term",
];

const ALLOWED_STATUSES = [
  "Present",
  "Absent",
  "Late",
  "Excused",
];

/**
 * Normalize a date to the beginning
 * of the day.
 *
 * This prevents different times on the
 * same calendar day from creating
 * separate attendance records.
 */
function normalizeDate(date) {
  const normalized = new Date(date);

  if (Number.isNaN(normalized.getTime())) {
    throw new Error(
      "Invalid attendance date."
    );
  }

  normalized.setHours(
    0,
    0,
    0,
    0
  );

  return normalized;
}

/**
 * Validate ObjectId.
 */
function validateObjectId(
  value,
  fieldName
) {
  if (
    !mongoose.Types.ObjectId.isValid(value)
  ) {
    throw new Error(
      `Invalid ${fieldName} ID.`
    );
  }
}

/**
 * Find the selected term inside
 * the academic session.
 */
function getSessionTerm(
  academicSession,
  term
) {
  if (!ALLOWED_TERMS.includes(term)) {
    throw new Error(
      "Invalid academic term."
    );
  }

  const sessionTerm =
    academicSession.terms?.find(
      (item) =>
        item.name === term
    );

  if (!sessionTerm) {
    throw new Error(
      `${term} does not exist in the selected academic session.`
    );
  }

  return sessionTerm;
}

/**
 * Validate that the attendance date
 * falls within the selected term.
 */
function validateDateWithinTerm(
  date,
  sessionTerm
) {
  if (
    !sessionTerm?.startDate ||
    !sessionTerm?.endDate
  ) {
    return;
  }

  const attendanceDate =
    normalizeDate(date);

  const termStart =
    normalizeDate(
      sessionTerm.startDate
    );

  const termEnd =
    normalizeDate(
      sessionTerm.endDate
    );

  if (
    attendanceDate < termStart ||
    attendanceDate > termEnd
  ) {
    throw new Error(
      `Attendance date must fall within ${sessionTerm.name}.`
    );
  }
}

/**
 * Validate the common entities
 * required by attendance.
 */
async function validateAttendanceEntities(
  data
) {
  const {
    student,
    class: classId,
    academicSession,
    term,
    date,
    status,
  } = data;

  validateObjectId(
    student,
    "student"
  );

  validateObjectId(
    classId,
    "class"
  );

  validateObjectId(
    academicSession,
    "academic session"
  );

  if (
    !ALLOWED_STATUSES.includes(status)
  ) {
    throw new Error(
      "Invalid attendance status."
    );
  }

  const attendanceDate =
    normalizeDate(date);

  const [
    studentRecord,
    classRecord,
    academicSessionRecord,
  ] = await Promise.all([
    Student.findById(student),
    Class.findById(classId),
    AcademicSession.findById(
      academicSession
    ),
  ]);

  // ----------------------------------------
  // Student validation
  // ----------------------------------------

  if (!studentRecord) {
    throw new Error(
      "Student not found."
    );
  }

  if (
    studentRecord.status !== "active"
  ) {
    throw new Error(
      "Cannot record attendance for an inactive student."
    );
  }

  // ----------------------------------------
  // Class validation
  // ----------------------------------------

  if (!classRecord) {
    throw new Error(
      "Class not found."
    );
  }

  if (
    classRecord.isActive === false
  ) {
    throw new Error(
      "Cannot record attendance for an inactive class."
    );
  }

  // ----------------------------------------
  // Student/Class relationship
  // ----------------------------------------

  if (
    !studentRecord.class ||
    studentRecord.class.toString() !==
      classId.toString()
  ) {
    throw new Error(
      "Student does not belong to the selected class."
    );
  }

  // ----------------------------------------
  // Academic session
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
      "Cannot record attendance for a completed academic session."
    );
  }

  // ----------------------------------------
  // Term
  // ----------------------------------------

  const sessionTerm =
    getSessionTerm(
      academicSessionRecord,
      term
    );

  // ----------------------------------------
  // Date
  // ----------------------------------------

  validateDateWithinTerm(
    attendanceDate,
    sessionTerm
  );

  return {
    studentRecord,
    classRecord,
    academicSessionRecord,
    sessionTerm,
    attendanceDate,
  };
}

/**
 * Populate attendance records
 * consistently.
 */
function populateAttendance(
  query
) {
  return query
    .populate({
      path: "student",
      select:
        "admissionNumber firstName middleName lastName gender status class",
    })
    .populate({
      path: "class",
      select:
        "name code level section isActive",
    })
    .populate({
      path: "academicSession",
      select:
        "name startDate endDate isActive isCompleted terms",
    })
    .populate({
      path: "recordedBy",
      select:
        "firstName lastName email",
    });
}

async function getTeacherByUserId(
  userId
) {
  validateObjectId(
    userId,
    "user"
  );

  const teacher =
    await Teacher.findOne({
      user: userId,
      isActive: true,
    });

  return teacher;
}

async function ensureTeacherCanAccessClass({
  userId,
  userRole,
  classId,
  academicSession,
  term,
}) {
  /*
   * Administrators are allowed to record
   * attendance for any authorized class.
   */
  if (
    String(userRole).toLowerCase() ===
    "administrator"
  ) {
    return {
      teacher: null,
      assignment: null,
    };
  }

  /*
   * Teachers must have an active
   * Teacher profile.
   */
  const teacher =
    await getTeacherByUserId(userId);

  if (!teacher) {
    throw new Error(
      "Teacher profile not found."
    );
  }

  const assignment =
    await TeacherAssignment.findOne({
      teacher: teacher._id,
      class: classId,
      academicSession,
      term,
      isActive: true,
    });

  if (!assignment) {
    throw new Error(
      "You are not assigned to this class for the selected academic session and term."
    );
  }

  return {
    teacher,
    assignment,
  };
}

/**
 * Create a single attendance record.
 */
export async function createAttendance(
  data,
  recordedBy,
  userRole
) {
  validateObjectId(
    recordedBy,
    "recorded by user"
  );

  await validateAttendanceEntities(
    data
  );

  await ensureTeacherCanAccessClass({
    userId: recordedBy,
    userRole,
    classId: data.class,
    academicSession:
      data.academicSession,
    term: data.term,
  });

  const attendanceDate =
    normalizeDate(data.date);

  const existing =
    await Attendance.findOne({
      student: data.student,
      academicSession:
        data.academicSession,
      term: data.term,
      date: attendanceDate,
    });

  if (existing) {
    throw new Error(
      "Attendance has already been recorded for this student on this date."
    );
  }

  try {
    const attendance =
      await Attendance.create({
        student: data.student,
        class: data.class,
        academicSession:
          data.academicSession,
        term: data.term,
        date: attendanceDate,
        status: data.status,
        remarks:
          data.remarks || "",
        recordedBy,
      });

    return getAttendanceById(
      attendance._id
    );
  } catch (error) {
    if (
      error.code === 11000
    ) {
      throw new Error(
        "Attendance has already been recorded for this student on this date."
      );
    }

    throw error;
  }
}

/**
 * Create/update attendance for
 * multiple students in one request.
 *
 * This is the main operation that
 * the teacher frontend will use.
 */
export async function saveBulkAttendance(
  data,
  recordedBy,
  userRole,
) {
  validateObjectId(
    recordedBy,
    "recorded by user"
  );

  const {
    class: classId,
    academicSession,
    term,
    date,
    records,
  } = data;

  validateObjectId(
    classId,
    "class"
  );

  validateObjectId(
    academicSession,
    "academic session"
  );

  await ensureTeacherCanAccessClass({
      userId: recordedBy,
      classId,
      userRole,
      academicSession,
      term,
  });

  if (!Array.isArray(records)) {
    throw new Error(
      "Attendance records must be an array."
    );
  }

  if (records.length === 0) {
    throw new Error(
      "At least one attendance record is required."
    );
  }

  const attendanceDate =
    normalizeDate(date);

  /*
   * Validate session/class/date once
   * before processing every student.
   */
  const [
    classRecord,
    academicSessionRecord,
  ] = await Promise.all([
    Class.findById(classId),
    AcademicSession.findById(
      academicSession
    ),
  ]);

  if (!classRecord) {
    throw new Error(
      "Class not found."
    );
  }

  if (
    classRecord.isActive === false
  ) {
    throw new Error(
      "Cannot record attendance for an inactive class."
    );
  }

  if (!academicSessionRecord) {
    throw new Error(
      "Academic session not found."
    );
  }

  if (
    academicSessionRecord.isCompleted
  ) {
    throw new Error(
      "Cannot record attendance for a completed academic session."
    );
  }

  const sessionTerm =
    getSessionTerm(
      academicSessionRecord,
      term
    );

  validateDateWithinTerm(
    attendanceDate,
    sessionTerm
  );

  /*
   * Prevent duplicate student IDs
   * inside the same request.
   */
  const studentIds =
    records.map(
      (record) => record.student
    );

  const uniqueStudentIds =
    new Set(
      studentIds.map(
        (id) => id.toString()
      )
    );

  if (
    uniqueStudentIds.size !==
    studentIds.length
  ) {
    throw new Error(
      "A student appears more than once in the attendance records."
    );
  }

  for (const record of records) {
    validateObjectId(
      record.student,
      "student"
    );

    if (
      !ALLOWED_STATUSES.includes(
        record.status
      )
    ) {
      throw new Error(
        `Invalid attendance status for student ${record.student}.`
      );
    }
  }

  /*
   * Load all students at once.
   */
  const students =
    await Student.find({
      _id: {
        $in: studentIds,
      },
    }).select(
      "admissionNumber firstName middleName lastName status class"
    );

  if (
    students.length !==
    studentIds.length
  ) {
    throw new Error(
      "One or more students could not be found."
    );
  }

  const studentMap =
    new Map(
      students.map(
        (student) => [
          student._id.toString(),
          student,
        ]
      )
    );

  /*
   * Validate every student before
   * writing anything.
   */
  for (const record of records) {
    const student =
      studentMap.get(
        record.student.toString()
      );

    if (!student) {
      throw new Error(
        "Student not found."
      );
    }

    if (
      student.status !== "active"
    ) {
      throw new Error(
        `Cannot record attendance for inactive student ${student._id}.`
      );
    }

    if (
      !student.class ||
      student.class.toString() !==
        classId.toString()
    ) {
      throw new Error(
        `Student ${student._id} does not belong to the selected class.`
      );
    }
  }

  /*
   * Upsert attendance records.
   *
   * This allows a teacher to correct
   * attendance later without creating
   * duplicates.
   */
  const operations =
    records.map((record) => ({
      updateOne: {
        filter: {
          student: record.student,
          class: classId,
          academicSession,
          term,
          date: attendanceDate,
        },

        update: {
          $set: {
            class: classId,
            status: record.status,
            remarks:
            record.remarks || "",
            recordedBy,
          },
        },

        upsert: true,
      },
    }));

  try {
    const result =
      await Attendance.bulkWrite(
        operations,
        {
          ordered: true,
        }
      );

    return {
      matchedCount:
        result.matchedCount || 0,

      modifiedCount:
        result.modifiedCount || 0,

      upsertedCount:
        result.upsertedCount || 0,

      totalProcessed:
        records.length,
    };
  } catch (error) {
    if (
      error.code === 11000
    ) {
      throw new Error(
        "One or more attendance records already exist."
      );
    }

    throw error;
  }
}

/**
 * Get attendance records.
 */
export async function getAttendance(
  filters = {},
  userId,
  userRole
) {
  const query = {};

  if (userId) {
    validateObjectId(
      userId,
      "user"
    );

    if (String(userRole).toLowerCase() ==="teacher") {
    // teacher assignment filtering

      const teacher =
      await getTeacherByUserId(userId);

      if (teacher) {
        const assignmentFilter = {
          teacher: teacher._id,
          isActive: true,
        };

        if (filters.academicSession) {
          assignmentFilter.academicSession =
            filters.academicSession;
        }

        if (filters.term) {
          assignmentFilter.term =
            filters.term;
        }

        const assignedClasses =
          await TeacherAssignment.find(
            assignmentFilter
          ).distinct("class");

        if (filters.class) {
          const hasAccess =
            assignedClasses.some(
              (id) =>
                id.toString() ===
                filters.class.toString()
            );

          if (!hasAccess) {
            throw new Error(
              "You are not assigned to this class for the selected academic session and term."
            );
          }

          query.class =
            filters.class;
        } else {
          query.class = {
            $in: assignedClasses,
          };
        }
      }
    }

    
  }

  if (filters.student) {
    validateObjectId(
      filters.student,
      "student"
    );

    query.student =
      filters.student;
  }

  if (filters.class) {
    validateObjectId(
      filters.class,
      "class"
    );

    query.class =
      filters.class;
  }

  if (filters.academicSession) {
    validateObjectId(
      filters.academicSession,
      "academic session"
    );

    query.academicSession =
      filters.academicSession;
  }

  if (filters.term) {
    if (
      !ALLOWED_TERMS.includes(
        filters.term
      )
    ) {
      throw new Error(
        "Invalid academic term."
      );
    }

    query.term = filters.term;
  }

  if (filters.status) {
    if (
      !ALLOWED_STATUSES.includes(
        filters.status
      )
    ) {
      throw new Error(
        "Invalid attendance status."
      );
    }

    query.status =
      filters.status;
  }

  if (filters.date) {
    query.date =
      normalizeDate(filters.date);
  }

  if (
    filters.startDate ||
    filters.endDate
  ) {
    query.date = {};

    if (filters.startDate) {
      query.date.$gte =
        normalizeDate(
          filters.startDate
        );
    }

    if (filters.endDate) {
      query.date.$lte =
        normalizeDate(
          filters.endDate
        );
    }
  }

//   const teacher = await Teacher.findOne({
//     user: userId,
//     isActive: true,
//   });

// if (teacher) {
//   const assignedClasses =
//     await TeacherAssignment.find({
//       teacher: teacher._id,
//       isActive: true,
//       // ...(academicSession ? {academicSession,}: {}),
//       // ...(term ? { term,}: {}),
//     }).distinct("class");

//   /*
//    * If a specific class was requested,
//    * make sure the teacher is assigned
//    * to it.
//    */
//   if (classId) {
//     const hasAccess =
//       assignedClasses.some(
//         (id) =>
//           id.toString() ===
//           classId.toString()
//       );

//     if (!hasAccess) {
//       throw new Error(
//         "You are not assigned to this class for the selected academic session and term."
//       );
//     }
//   }
// }

  const attendance =
    populateAttendance(
      Attendance.find(query)
    );

  return attendance.sort({
    date: -1,
    createdAt: -1,
  });
}

/**
 * Get student attendance Statistics.
 */
export async function getStudentAttendanceStatistics(
  studentId,
  filters = {},
  userId,
  userRole
) {
  validateObjectId(studentId, "student");

  const {
    academicSession,
    term,
    startDate,
    endDate,
  } = filters;

  // Verify that the student exists.
  const student = await Student.findById(
    studentId
  ).populate("class", "name");

  if (!student) {
    throw new Error("Student not found.");
  }

  /*
   * Teachers may only view attendance
   * belonging to students in their assigned
   * classes.
   */
  if (
    String(userRole).toLowerCase() ===
    "teacher"
  ) {
    const teacher =
      await getTeacherByUserId(userId);

    if (!teacher) {
      throw new Error(
        "Teacher profile not found."
      );
    }

    const assignmentFilter = {
      teacher: teacher._id,
      isActive: true,
    };

    if (academicSession) {
      assignmentFilter.academicSession =
        academicSession;
    }

    if (term) {
      assignmentFilter.term = term;
    }

    const assignedClasses =
      await TeacherAssignment.find(
        assignmentFilter
      ).distinct("class");

    const studentClassId =
      student.class?._id ||
      student.class;

    const hasAccess =
      assignedClasses.some(
        (classId) =>
          classId.toString() ===
          studentClassId?.toString()
      );

    if (!hasAccess) {
      throw new Error(
        "You are not assigned to this student's class."
      );
    }
  }

  const query = {
    student: studentId,
  };

  if (academicSession) {
    validateObjectId(
      academicSession,
      "academicSession"
    );

    query.academicSession =
      academicSession;
  }

  if (term) {
    query.term = term;
  }

  if (startDate || endDate) {
    query.date = {};

    if (startDate) {
      query.date.$gte = new Date(
        `${startDate}T00:00:00.000Z`
      );
    }

    if (endDate) {
      query.date.$lte = new Date(
        `${endDate}T23:59:59.999Z`
      );
    }
  }

  const records =
    await Attendance.find(query)
      .populate(
        "class",
        "name code"
      )
      .populate(
        "academicSession",
        "name"
      )
      .sort({
        date: -1,
      })
      .lean();

  const statistics = {
    total: records.length,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    attendancePercentage: 0,
  };

  records.forEach((record) => {
    switch (record.status) {
      case "Present":
        statistics.present++;
        break;

      case "Absent":
        statistics.absent++;
        break;

      case "Late":
        statistics.late++;
        break;

      case "Excused":
        statistics.excused++;
        break;

      default:
        break;
    }
  });

  /*
   * Excused attendance is not counted as
   * present or absent for the percentage.
   */
  const countedDays =
    statistics.present +
    statistics.absent +
    statistics.late;

  if (countedDays > 0) {
    statistics.attendancePercentage =
      Number(
        (
          ((statistics.present +
            statistics.late) /
            countedDays) *
          100
        ).toFixed(2)
      );
  }

  return {
    student: {
      _id: student._id,
      admissionNumber:
        student.admissionNumber,
      firstName:
        student.firstName,
      middleName:
        student.middleName,
      lastName:
        student.lastName,
      class: student.class,
    },

    filters: {
      academicSession:
        academicSession || null,
      term: term || null,
      startDate:
        startDate || null,
      endDate:
        endDate || null,
    },

    statistics,

    records,
  };
}

/**
 * Get class attendance Statistics.
 */
export async function getClassAttendanceStatistics(
  classId,
  filters = {},
  userId,
  userRole
) {
  validateObjectId(classId, "class");

  const {
    academicSession,
    term,
    startDate,
    endDate,
  } = filters;

  /*
   * Teachers can only view classes they are
   * assigned to.
   */
  if (
    String(userRole).toLowerCase() ===
    "teacher"
  ) {
    const teacher =
      await getTeacherByUserId(userId);

    if (!teacher) {
      throw new Error(
        "Teacher profile not found."
      );
    }

    const assignmentFilter = {
      teacher: teacher._id,
      class: classId,
      isActive: true,
    };

    if (academicSession) {
      assignmentFilter.academicSession =
        academicSession;
    }

    if (term) {
      assignmentFilter.term = term;
    }

    const assignment =
      await TeacherAssignment.findOne(
        assignmentFilter
      );

    if (!assignment) {
      throw new Error(
        "You are not assigned to this class for the selected academic session and term."
      );
    }
  }

  /*
   * Verify class.
   */
  const classItem =
    await Class.findById(classId).lean();

  if (!classItem) {
    throw new Error("Class not found.");
  }

  /*
   * Attendance query.
   */
  const attendanceQuery = {
    class: classId,
  };

  if (academicSession) {
    validateObjectId(
      academicSession,
      "academicSession"
    );

    attendanceQuery.academicSession =
      academicSession;
  }

  if (term) {
    attendanceQuery.term = term;
  }

  if (startDate || endDate) {
    attendanceQuery.date = {};

    if (startDate) {
      attendanceQuery.date.$gte =
        new Date(
          `${startDate}T00:00:00.000Z`
        );
    }

    if (endDate) {
      attendanceQuery.date.$lte =
        new Date(
          `${endDate}T23:59:59.999Z`
        );
    }
  }

  const records =
    await Attendance.find(
      attendanceQuery
    )
      .populate(
        "student",
        "firstName middleName lastName admissionNumber"
      )
      .lean();

  /*
   * Class-level totals.
   */
  const statistics = {
    totalRecords: records.length,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    attendancePercentage: 0,
  };

  records.forEach((record) => {
    switch (record.status) {
      case "Present":
        statistics.present++;
        break;

      case "Absent":
        statistics.absent++;
        break;

      case "Late":
        statistics.late++;
        break;

      case "Excused":
        statistics.excused++;
        break;

      default:
        break;
    }
  });

  const countedDays =
    statistics.present +
    statistics.absent +
    statistics.late;

  if (countedDays > 0) {
    statistics.attendancePercentage =
      Number(
        (
          ((statistics.present +
            statistics.late) /
            countedDays) *
          100
        ).toFixed(2)
      );
  }

  /*
   * Student breakdown.
   */
  const studentsInClass =
  await Student.find({
    class: classId,
  })
    .select(
      "firstName middleName lastName admissionNumber"
    )
    .lean();

const studentMap = new Map();

/*
 * First create an entry for EVERY student
 * enrolled in the class.
 */
studentsInClass.forEach((student) => {
  const studentId =
    student._id.toString();

  studentMap.set(studentId, {
    student: {
      _id: student._id,
      firstName:
        student.firstName,
      middleName:
        student.middleName,
      lastName:
        student.lastName,
      admissionNumber:
        student.admissionNumber,
    },

    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    attendancePercentage: 0,
  });
});

/*
 * Now merge attendance records into
 * the students already enrolled.
 */
records.forEach((record) => {
  const student = record.student;

  if (!student) {
    return;
  }

  const studentId =
    student._id.toString();

  /*
   * Normally this student already exists
   * because they belong to the class.
   */
  if (!studentMap.has(studentId)) {
    studentMap.set(studentId, {
      student: {
        _id: student._id,
        firstName:
          student.firstName,
        middleName:
          student.middleName,
        lastName:
          student.lastName,
        admissionNumber:
          student.admissionNumber,
      },

      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      attendancePercentage: 0,
    });
  }

  const item =
    studentMap.get(studentId);

  item.total++;

  switch (record.status) {
    case "Present":
      item.present++;
      break;

    case "Absent":
      item.absent++;
      break;

    case "Late":
      item.late++;
      break;

    case "Excused":
      item.excused++;
      break;

    default:
      break;
  }
});

const students =
  Array.from(
    studentMap.values()
  ).map((item) => {
    const countedDays =
      item.present +
      item.absent +
      item.late;

    if (countedDays > 0) {
      item.attendancePercentage =
        Number(
          (
            ((item.present +
              item.late) /
              countedDays) *
            100
          ).toFixed(2)
        );
    }

    return item;
  });

students.sort(
  (a, b) =>
    b.attendancePercentage -
    a.attendancePercentage
);

const lowAttendanceStudents =
  students.filter(
    (student) =>
      student.total > 0 &&
      student.attendancePercentage < 75
  );

  return {
    class: {
      _id: classItem._id,
      name: classItem.name,
      code: classItem.code,
    },

    totalStudents:studentsInClass.length,

    filters: {
      academicSession:
        academicSession || null,
      term: term || null,
      startDate:
        startDate || null,
      endDate:
        endDate || null,
    },

    statistics,

    students,

    lowAttendanceStudents,
  };
}

/**
 * Get class attendance Dashboard.
 */
export async function getAttendanceDashboard(
  filters = {},
  userId,
  userRole
) {
  const {
    academicSession,
    term,
    startDate,
    endDate,
  } = filters;

  if (academicSession) {
    validateObjectId(
      academicSession,
      "academicSession"
    );
  }

  /*
   * Determine the classes the user can access.
   */
  let classQuery = {};

  if (
    String(userRole).toLowerCase() ===
    "teacher"
  ) {
    const teacher =
      await getTeacherByUserId(userId);

    if (!teacher) {
      throw new Error(
        "Teacher profile not found."
      );
    }

    const assignmentFilter = {
      teacher: teacher._id,
      isActive: true,
    };

    if (academicSession) {
      assignmentFilter.academicSession =
        academicSession;
    }

    if (term) {
      assignmentFilter.term = term;
    }

    const assignments =
      await TeacherAssignment.find(
        assignmentFilter
      )
        .select("class")
        .lean();

    const classIds =
      assignments.map(
        (assignment) =>
          assignment.class
      );

    classQuery = {
      _id: {
        $in: classIds,
      },
    };
  }

  const classes =
    await Class.find(classQuery)
      .select("name code")
      .lean();

  /*
   * Build attendance query.
   */
  const attendanceQuery = {};

  if (academicSession) {
    attendanceQuery.academicSession =
      academicSession;
  }

  if (term) {
    attendanceQuery.term = term;
  }

  if (startDate || endDate) {
    attendanceQuery.date = {};

    if (startDate) {
      attendanceQuery.date.$gte =
        new Date(
          `${startDate}T00:00:00.000Z`
        );
    }

    if (endDate) {
      attendanceQuery.date.$lte =
        new Date(
          `${endDate}T23:59:59.999Z`
        );
    }
  }

  /*
   * If no date range was provided,
   * use today's date for the daily summary.
   */
  const todayStart =
    new Date();

  todayStart.setHours(
    0,
    0,
    0,
    0
  );

  const todayEnd =
    new Date();

  todayEnd.setHours(
    23,
    59,
    59,
    999
  );

  const todayQuery = {
    ...attendanceQuery,
    date: {
      $gte: startDate
        ? attendanceQuery.date.$gte
        : todayStart,

      $lte: endDate
        ? attendanceQuery.date.$lte
        : todayEnd,
    },
  };

  const [records, todayRecords] =
  await Promise.all([
    Attendance.find(attendanceQuery)
      .populate(
        "student",
        "firstName middleName lastName admissionNumber"
      )
      .populate(
        "class",
        "name code"
      )
      .lean(),

    Attendance.find(todayQuery).lean(),
  ]);

  /*
   * Overall summary.
   */
  const summary = {
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    total: records.length,
    attendancePercentage: 0,
  };

  records.forEach((record) => {
    switch (record.status) {
      case "Present":
        summary.present++;
        break;

      case "Absent":
        summary.absent++;
        break;

      case "Late":
        summary.late++;
        break;

      case "Excused":
        summary.excused++;
        break;

      default:
        break;
    }
  });

  const counted =
    summary.present +
    summary.absent +
    summary.late;

  if (counted > 0) {
    summary.attendancePercentage =
      Number(
        (
          ((summary.present +
            summary.late) /
            counted) *
          100
        ).toFixed(2)
      );
  }

  /*
   * Today's summary.
   */
  const today = {
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    total: todayRecords.length,
  };

  todayRecords.forEach((record) => {
    switch (record.status) {
      case "Present":
        today.present++;
        break;

      case "Absent":
        today.absent++;
        break;

      case "Late":
        today.late++;
        break;

      case "Excused":
        today.excused++;
        break;

      default:
        break;
    }
  });

  /*
   * Class performance.
   */
  const classMap = new Map();

  classes.forEach((classItem) => {
    classMap.set(
      classItem._id.toString(),
      {
        class: {
          _id: classItem._id,
          name: classItem.name,
          code: classItem.code,
        },

        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        attendancePercentage: 0,
      }
    );
  });

  records.forEach((record) => {
    if (!record.class) {
      return;
    }

    const classId = record.class?._id?.toString();
    if (!classId) {
      return;
    }

    if (!classMap.has(classId)) {
      return;
    }

    const item =
      classMap.get(classId);

    item.total++;

    switch (record.status) {
      case "Present":
        item.present++;
        break;

      case "Absent":
        item.absent++;
        break;

      case "Late":
        item.late++;
        break;

      case "Excused":
        item.excused++;
        break;

      default:
        break;
    }
  });

  const classPerformance =
    Array.from(
      classMap.values()
    ).map((item) => {
      const countedDays =
        item.present +
        item.absent +
        item.late;

      if (countedDays > 0) {
        item.attendancePercentage =
          Number(
            (
              ((item.present +
                item.late) /
                countedDays) *
              100
            ).toFixed(2)
          );
      }

      return item;
    });

  /*
   * Students requiring attention.
   */
  const studentMap = new Map();

  records.forEach((record) => {
    const student =
      record.student;

    if (!student) {
      return;
    }

    const studentId =
      student._id.toString();

    if (!studentMap.has(studentId)) {
      studentMap.set(
        studentId,
        {
          student: {
            _id: student._id,
            firstName:
              student.firstName,
            middleName:
              student.middleName,
            lastName:
              student.lastName,
            admissionNumber:
              student.admissionNumber,
          },

          class:
            record.class || null,

          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          attendancePercentage: 0,
        }
      );
    }

    const item =
      studentMap.get(studentId);

    item.total++;

    switch (record.status) {
      case "Present":
        item.present++;
        break;

      case "Absent":
        item.absent++;
        break;

      case "Late":
        item.late++;
        break;

      case "Excused":
        item.excused++;
        break;

      default:
        break;
    }
  });

  const students =
    Array.from(
      studentMap.values()
    ).map((item) => {
      const countedDays =
        item.present +
        item.absent +
        item.late;

      if (countedDays > 0) {
        item.attendancePercentage =
          Number(
            (
              ((item.present +
                item.late) /
                countedDays) *
              100
            ).toFixed(2)
          );
      }

      return item;
    });

  const lowAttendanceStudents =
    students
      .filter(
        (student) =>
          student.total > 0 &&
          student.attendancePercentage <
            75
      )
      .sort(
        (a, b) =>
          a.attendancePercentage -
          b.attendancePercentage
      )
      .slice(0, 10);

  return {
    filters: {
      academicSession:
        academicSession || null,
      term:
        term || null,
      startDate:
        startDate || null,
      endDate:
        endDate || null,
    },

    summary,

    today,

    classPerformance,

    lowAttendanceStudents,
  };
}

/**
 * Get class attendance report.
 */
export async function getAttendanceReport(
  filters = {},
  userId,
  userRole
) {
  const {
    reportType = "class",
    classId,
    studentId,
    academicSession,
    term,
    startDate,
    endDate,
    status,
  } = filters;

  if (classId) {
    validateObjectId(classId, "class");
  }

  if (studentId) {
    validateObjectId(studentId, "student");
  }

  if (academicSession) {
    validateObjectId(
      academicSession,
      "academicSession"
    );
  }

  /*
   * Teacher authorization.
   */
  if (
    String(userRole).toLowerCase() ===
    "teacher"
  ) {
    const teacher =
      await getTeacherByUserId(userId);

    if (!teacher) {
      throw new Error(
        "Teacher profile not found."
      );
    }

    const assignmentQuery = {
      teacher: teacher._id,
      isActive: true,
    };

    if (academicSession) {
      assignmentQuery.academicSession =
        academicSession;
    }

    if (term) {
      assignmentQuery.term = term;
    }

    const assignments =
      await TeacherAssignment.find(
        assignmentQuery
      )
        .select("class")
        .lean();

    const assignedClassIds =
      assignments.map((item) =>
        item.class.toString()
      );

    if (
      classId &&
      !assignedClassIds.includes(
        classId.toString()
      )
    ) {
      throw new Error(
        "You are not assigned to this class."
      );
    }

    /*
     * If requesting a specific student,
     * verify the student's class.
     */
    if (studentId) {
      const student =
        await Student.findById(
          studentId
        )
          .select("class")
          .lean();

      if (!student) {
        throw new Error(
          "Student not found."
        );
      }

      if (
        !assignedClassIds.includes(
          student.class?.toString()
        )
      ) {
        throw new Error(
          "You are not assigned to this student's class."
        );
      }
    }
  }

  const query = {};

  if (classId) {
    query.class = classId;
  }

  if (studentId) {
    query.student = studentId;
  }

  if (academicSession) {
    query.academicSession =
      academicSession;
  }

  if (term) {
    query.term = term;
  }

  if (status) {
    query.status = status;
  }

  if (startDate || endDate) {
    query.date = {};

    if (startDate) {
      query.date.$gte = new Date(
        `${startDate}T00:00:00.000Z`
      );
    }

    if (endDate) {
      query.date.$lte = new Date(
        `${endDate}T23:59:59.999Z`
      );
    }
  }

  const records =
    await Attendance.find(query)
      .populate(
        "student",
        "firstName middleName lastName admissionNumber"
      )
      .populate(
        "class",
        "name code"
      )
      .populate(
        "academicSession",
        "name"
      )
      .sort({
        date: -1,
      })
      .lean();

  /*
   * Summary.
   */
  const summary = {
    total: records.length,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    attendancePercentage: 0,
  };

  records.forEach((record) => {
    switch (record.status) {
      case "Present":
        summary.present++;
        break;

      case "Absent":
        summary.absent++;
        break;

      case "Late":
        summary.late++;
        break;

      case "Excused":
        summary.excused++;
        break;

      default:
        break;
    }
  });

  const counted =
    summary.present +
    summary.absent +
    summary.late;

  if (counted > 0) {
    summary.attendancePercentage =
      Number(
        (
          ((summary.present +
            summary.late) /
            counted) *
          100
        ).toFixed(2)
      );
  }

  return {
    reportType,

    filters: {
      classId: classId || null,
      studentId: studentId || null,
      academicSession:
        academicSession || null,
      term: term || null,
      startDate:
        startDate || null,
      endDate:
        endDate || null,
      status: status || null,
    },

    summary,

    records,
  };
}

/**
 * Get one attendance record.
 */
export async function getAttendanceById(
  id
) {
  validateObjectId(
    id,
    "attendance"
  );

  return populateAttendance(
    Attendance.findById(id)
  );
}

/**
 * Update a single attendance record.
 */
export async function updateAttendance(
  id,
  data,
  recordedBy,
  userRole
) {
  validateObjectId(
    id,
    "attendance"
  );

  validateObjectId(
    recordedBy,
    "recorded by user"
  );

  const existing =
    await Attendance.findById(id);

  if (!existing) {
    return null;
  }

  const mergedData = {
    student:
      data.student ??
      existing.student,

    class:
      data.class ??
      existing.class,

    academicSession:
      data.academicSession ??
      existing.academicSession,

    term:
      data.term ??
      existing.term,

    date:
      data.date ??
      existing.date,

    status:
      data.status ??
      existing.status,

    remarks:
      data.remarks ??
      existing.remarks,
  };

  await validateAttendanceEntities(
    mergedData
  );

  await ensureTeacherCanAccessClass({
    userId: recordedBy,
    userRole,
    classId: mergedData.class,
    academicSession:
      mergedData.academicSession,
    term: mergedData.term,
  });

  existing.student =
    mergedData.student;

  existing.class =
    mergedData.class;

  existing.academicSession =
    mergedData.academicSession;

  existing.term =
    mergedData.term;

  existing.date =
    normalizeDate(
      mergedData.date
    );

  existing.status =
    mergedData.status;

  existing.remarks =
    mergedData.remarks || "";

  existing.recordedBy =
    recordedBy;

  try {
    await existing.save();
  } catch (error) {
    if (
      error.code === 11000
    ) {
      throw new Error(
        "Attendance has already been recorded for this student on this date."
      );
    }

    throw error;
  }

  return getAttendanceById(
    existing._id
  );
}

/**
 * Delete attendance.
 */
export async function deleteAttendance(
  id
) {
  validateObjectId(
    id,
    "attendance"
  );

  return Attendance.findByIdAndDelete(
    id
  );
}