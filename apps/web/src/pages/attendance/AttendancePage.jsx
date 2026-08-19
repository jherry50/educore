import { useEffect, useMemo, useState } from "react";

import {
  getAcademicSessions,
} from "../../api/academicSessionApi";

import {
  getClasses,
} from "../../api/classApi";

import {
  getStudents,
} from "../../api/studentApi";

import {
  getAttendance,
  saveBulkAttendance,
} from "../../api/attendanceApi";

import {
  getMyTeacherAssignments,
} from "../../api/teacherAssignmentApi";

import { useAuth } from "../../hooks/useAuth";

const STATUS_OPTIONS = [
  "Present",
  "Absent",
  "Late",
  "Excused",
];

const EMPTY_FORM = {
  academicSession: "",
  term: "",
  class: "",
  date: getTodayDate(),
};

export default function AttendancePage() {
  const [academicSessions, setAcademicSessions] =
    useState([]);

  const [classes, setClasses] =
    useState([]);

  const [students, setStudents] =
    useState([]);

  const [attendance, setAttendance] =
    useState({});

  const [form, setForm] =
    useState(EMPTY_FORM);

  const [loading, setLoading] =
    useState(false);

  const [loadingStudents, setLoadingStudents] =
    useState(false);

  const [loadingAttendance, setLoadingAttendance] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [hasLoaded, setHasLoaded] =
    useState(false);

  const { user } = useAuth();
  console.log("User in AttendancePage:", user);
  /*
   * Load sessions and classes
   * when the page opens.
   */
  useEffect(() => {
    if (!user) {
        return;
    }

    loadInitialData();
  }, [user]);

  useEffect(() => {
    if (
        user?.role?.name?.toLowerCase() !==
        "teacher" ||
        !form.academicSession ||
        !form.term
    ) {
        return;
    }

    loadTeacherClasses();
        }, [
        user,
        form.academicSession,
        form.term,
  ]);

 async function loadInitialData() {
  try {
    setLoading(true);
    setError("");

    const sessionsResponse =
      await getAcademicSessions({
        limit: 100,
      });

    const sessions =
      extractList(
        sessionsResponse
      );

    setAcademicSessions(sessions);

    const role =
      user?.role?.name?.toLowerCase();

    const isTeacher =
      role === "teacher";
debugger
    if (isTeacher) {
      /*
       * Teachers should only see classes
       * they are assigned to.
       */
      const assignmentsResponse =
        await getMyTeacherAssignments();

      const assignments =
        extractList(
          assignmentsResponse
        );

      const uniqueClasses =
        Array.from(
          new Map(
            assignments
              .map(
                (assignment) =>
                  assignment.class
              )
              .filter(Boolean)
              .filter(
                (classItem) =>
                  classItem.isActive !==
                  false
              )
              .map((classItem) => [
                classItem._id.toString(),
                classItem,
              ])
          ).values()
        );

      setClasses(
        uniqueClasses
      );
    } else {
      /*
       * Admin and other authorized
       * roles can use the normal
       * class list.
       */
      const classesResponse =
        await getClasses({
          limit: 100,
        });

      const classList =
        extractList(
          classesResponse
        );

      setClasses(classList);
    }
  } catch (err) {
    console.error(
      "Failed to load attendance options:",
      err
    );

    setError(
      err?.response?.data?.message ||
        err?.message ||
        "Unable to load attendance options."
    );
  } finally {
    setLoading(false);
  }
}

async function loadTeacherClasses() {
  try {
    setLoading(true);
    setError("");

    const response =
      await getMyTeacherAssignments({
        academicSession:
          form.academicSession,

        term: form.term,
      });

    const assignments =
      extractList(response);

    const uniqueClasses =
      Array.from(
        new Map(
          assignments
            .map(
              (assignment) =>
                assignment.class
            )
            .filter(Boolean)
            .filter(
              (classItem) =>
                classItem.isActive !==
                false
            )
            .map((classItem) => [
              classItem._id.toString(),
              classItem,
            ])
        ).values()
      );

    setClasses(
      uniqueClasses
    );

    /*
     * If the previously selected class
     * isn't assigned in this session/term,
     * clear it.
     */
    setForm((current) => {
      const stillAssigned =
        uniqueClasses.some(
          (classItem) =>
            classItem._id ===
            current.class
        );

      if (stillAssigned) {
        return current;
      }

      return {
        ...current,
        class: "",
      };
    });
  } catch (err) {
    console.error(
      "Failed to load teacher classes:",
      err
    );

    setClasses([]);

    setError(
      err?.response?.data?.message ||
        err?.message ||
        "Unable to load your assigned classes."
    );
  } finally {
    setLoading(false);
  }
}

  /*
   * Terms come directly from
   * the selected Academic Session.
   */
  const selectedSession =
    useMemo(
      () =>
        academicSessions.find(
          (session) =>
            session._id ===
            form.academicSession
        ),
      [
        academicSessions,
        form.academicSession,
      ]
    );

  const availableTerms =
    selectedSession?.terms || [];

  /*
   * Only active classes should be
   * available for attendance.
   */
  const activeClasses =
    useMemo(
      () =>
        classes.filter(
          (classItem) =>
            classItem.isActive !== false
        ),
      [classes]
    );

  /*
   * Load students and existing
   * attendance when all filters
   * are selected.
   */
  useEffect(() => {
    if (
      !form.academicSession ||
      !form.term ||
      !form.class ||
      !form.date
    ) {
      setStudents([]);
      setAttendance({});
      setHasLoaded(false);

      return;
    }

    loadAttendanceRegister();
  }, [
    form.academicSession,
    form.term,
    form.class,
    form.date,
  ]);

  async function loadAttendanceRegister() {
    try {
      setLoadingStudents(true);
      setLoadingAttendance(true);
      setError("");
      setSuccess("");

      const [
        studentsResponse,
        attendanceResponse,
      ] = await Promise.all([
        getStudents({
          classId: form.class,
          status: "active",
          limit: 500,
        }),

        getAttendance({
          class: form.class,
          academicSession:
            form.academicSession,
          term: form.term,
          date: form.date,
        }),
      ]);

      const studentList =
        extractList(
          studentsResponse
        );

      const attendanceList =
        extractList(
          attendanceResponse
        );

      setStudents(studentList);

      /*
       * Convert attendance array into:
       *
       * {
       *   studentId: {
       *     status: "Present",
       *     remarks: ""
       *   }
       * }
       */
      const attendanceMap = {};

      attendanceList.forEach(
        (record) => {
          const studentId =
            record.student?._id ||
            record.student;

          if (!studentId) {
            return;
          }

          attendanceMap[
            studentId
          ] = {
            status:
              record.status ||
              "Present",

            remarks:
              record.remarks || "",
          };
        }
      );

      /*
       * Students without an existing
       * attendance record default
       * to Present.
       */
      studentList.forEach(
        (student) => {
          if (
            !attendanceMap[
              student._id
            ]
          ) {
            attendanceMap[
              student._id
            ] = {
              status: "Present",
              remarks: "",
            };
          }
        }
      );

      setAttendance(
        attendanceMap
      );

      setHasLoaded(true);
    } catch (err) {
      console.error(
        "Failed to load attendance register:",
        err
      );

      setStudents([]);
      setAttendance({});
      setHasLoaded(false);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load attendance."
      );
    } finally {
      setLoadingStudents(false);
      setLoadingAttendance(false);
    }
  }

  function handleSessionChange(
    event
  ) {
    setForm((current) => ({
      ...current,
      academicSession:
        event.target.value,
      term: "",
    }));

    setStudents([]);
    setAttendance({});
    setHasLoaded(false);
    setSuccess("");
  }

  function handleTermChange(
    event
  ) {
    setForm((current) => ({
      ...current,
      term: event.target.value,
    }));

    setStudents([]);
    setAttendance({});
    setHasLoaded(false);
    setSuccess("");
  }

  function handleClassChange(
    event
  ) {
    setForm((current) => ({
      ...current,
      class: event.target.value,
    }));

    setStudents([]);
    setAttendance({});
    setHasLoaded(false);
    setSuccess("");
  }

  function handleDateChange(
    event
  ) {
    setForm((current) => ({
      ...current,
      date: event.target.value,
    }));

    setStudents([]);
    setAttendance({});
    setHasLoaded(false);
    setSuccess("");
  }

  function updateStudentStatus(
    studentId,
    status
  ) {
    setAttendance((current) => ({
      ...current,

      [studentId]: {
        ...current[studentId],
        status,
      },
    }));

    setSuccess("");
  }

  function updateStudentRemarks(
    studentId,
    remarks
  ) {
    setAttendance((current) => ({
      ...current,

      [studentId]: {
        ...current[studentId],
        remarks,
      },
    }));
  }

  function markAllPresent() {
    setAttendance((current) => {
      const updated = {
        ...current,
      };

      students.forEach(
        (student) => {
          updated[
            student._id
          ] = {
            ...updated[
              student._id
            ],
            status: "Present",
          };
        }
      );

      return updated;
    });

    setSuccess("");
  }

  function markAllAbsent() {
    setAttendance((current) => {
      const updated = {
        ...current,
      };

      students.forEach(
        (student) => {
          updated[
            student._id
          ] = {
            ...updated[
              student._id
            ],
            status: "Absent",
          };
        }
      );

      return updated;
    });

    setSuccess("");
  }

  async function handleSave() {
    if (
      !form.academicSession ||
      !form.term ||
      !form.class ||
      !form.date
    ) {
      setError(
        "Please select an academic session, term, class and date."
      );

      return;
    }

    if (
      students.length === 0
    ) {
      setError(
        "There are no students available for this class."
      );

      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const records =
        students.map(
          (student) => ({
            student:
              student._id,

            status:
              attendance[
                student._id
              ]?.status ||
              "Present",

            remarks:
              attendance[
                student._id
              ]?.remarks ||
              "",
          })
        );

      await saveBulkAttendance({
        class: form.class,

        academicSession:
          form.academicSession,

        term: form.term,

        date: form.date,

        records,
      });

      setSuccess(
        "Attendance saved successfully."
      );

      /*
       * Reload so the UI reflects
       * the actual database state.
       */
      await loadAttendanceRegister();
    } catch (err) {
      console.error(
        "Failed to save attendance:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to save attendance."
      );
    } finally {
      setSaving(false);
    }
  }

  const summary =
    useMemo(() => {
      const result = {
        Present: 0,
        Absent: 0,
        Late: 0,
        Excused: 0,
      };

      students.forEach(
        (student) => {
          const status =
            attendance[
              student._id
            ]?.status;

          if (
            result[status] !==
            undefined
          ) {
            result[status]++;
          }
        }
      );

      return result;
    }, [
      students,
      attendance,
    ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Attendance
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Record and manage student
          attendance by academic
          session, term and class.
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {/* Session */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Academic Session
            </label>

            <select
              value={
                form.academicSession
              }
              onChange={
                handleSessionChange
              }
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
            >
              <option value="">
                Select session
              </option>

              {academicSessions.map(
                (session) => (
                  <option
                    key={session._id}
                    value={session._id}
                  >
                    {session.name}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Term */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Term
            </label>

            <select
              value={form.term}
              onChange={
                handleTermChange
              }
              disabled={
                !form.academicSession
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
            >
              <option value="">
                Select term
              </option>

              {availableTerms.map(
                (term) => (
                  <option
                    key={
                      term._id ||
                      term.name
                    }
                    value={term.name}
                  >
                    {term.name}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Class */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Class
            </label>

            <select
              value={form.class}
              onChange={
                handleClassChange
              }
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
            >
              <option value="">
                Select class
              </option>

              {activeClasses.map(
                (classItem) => (
                  <option
                    key={classItem._id}
                    value={classItem._id}
                  >
                    {classItem.name}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Date
            </label>

            <input
              type="date"
              value={form.date}
              onChange={
                handleDateChange
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </div>

      {/* Loading */}
      {loadingStudents ||
      loadingAttendance ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-sm text-slate-500">
            Loading attendance register...
          </p>
        </div>
      ) : null}

      {/* Register */}
      {!loadingStudents &&
      !loadingAttendance &&
      hasLoaded ? (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <SummaryCard
              label="Present"
              value={
                summary.Present
              }
            />

            <SummaryCard
              label="Absent"
              value={
                summary.Absent
              }
            />

            <SummaryCard
              label="Late"
              value={summary.Late}
            />

            <SummaryCard
              label="Excused"
              value={
                summary.Excused
              }
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-slate-900">
                {students.length}{" "}
                {students.length === 1
                  ? "Student"
                  : "Students"}
              </p>

              <p className="text-sm text-slate-500">
                Mark attendance for the
                selected date.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={
                  markAllPresent
                }
                disabled={saving}
                className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
              >
                Mark All Present
              </button>

              <button
                type="button"
                onClick={
                  markAllAbsent
                }
                disabled={saving}
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
              >
                Mark All Absent
              </button>

              <button
                type="button"
                onClick={
                  handleSave
                }
                disabled={saving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Save Attendance"}
              </button>
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      #
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Student
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Admission No.
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Attendance
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Remarks
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {students.map(
                    (
                      student,
                      index
                    ) => {
                      const record =
                        attendance[
                          student._id
                        ] || {};

                      return (
                        <AttendanceRow
                          key={
                            student._id
                          }
                          student={
                            student
                          }
                          index={
                            index
                          }
                          record={
                            record
                          }
                          onStatusChange={
                            updateStudentStatus
                          }
                          onRemarksChange={
                            updateStudentRemarks
                          }
                        />
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {students.map(
              (
                student,
                index
              ) => {
                const record =
                  attendance[
                    student._id
                  ] || {};

                return (
                  <AttendanceCard
                    key={
                      student._id
                    }
                    student={
                      student
                    }
                    index={
                      index
                    }
                    record={
                      record
                    }
                    onStatusChange={
                      updateStudentStatus
                    }
                    onRemarksChange={
                      updateStudentRemarks
                    }
                  />
                );
              }
            )}
          </div>
        </div>
      ) : null}

      {/* Empty state */}
      {!loading &&
      !loadingStudents &&
      !loadingAttendance &&
      !hasLoaded ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <h3 className="font-medium text-slate-900">
            Select attendance options
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Select an academic session,
            term, class and date to load
            the attendance register.
          </p>
        </div>
      ) : null}
    </div>
  );
}

/* ---------------------------------------
   Attendance row
---------------------------------------- */

function AttendanceRow({
  student,
  index,
  record,
  onStatusChange,
  onRemarksChange,
}) {
  return (
    <tr>
      <td className="px-6 py-4 text-sm text-slate-500">
        {index + 1}
      </td>

      <td className="px-6 py-4">
        <div className="font-medium text-slate-900">
          {getStudentName(student)}
        </div>

        {student.gender && (
          <div className="mt-0.5 text-xs text-slate-500">
            {student.gender}
          </div>
        )}
      </td>

      <td className="px-6 py-4 text-sm text-slate-600">
        {student.admissionNumber ||
          "—"}
      </td>

      <td className="px-6 py-4">
        <StatusSelector
          value={
            record.status ||
            "Present"
          }
          onChange={(status) =>
            onStatusChange(
              student._id,
              status
            )
          }
        />
      </td>

      <td className="px-6 py-4">
        <input
          type="text"
          value={
            record.remarks || ""
          }
          onChange={(event) =>
            onRemarksChange(
              student._id,
              event.target.value
            )
          }
          placeholder="Optional"
          className="w-full min-w-[180px] rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </td>
    </tr>
  );
}

/* ---------------------------------------
   Mobile attendance card
---------------------------------------- */

function AttendanceCard({
  student,
  index,
  record,
  onStatusChange,
  onRemarksChange,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-slate-400">
            #{index + 1}
          </p>

          <h3 className="font-medium text-slate-900">
            {getStudentName(student)}
          </h3>

          <p className="mt-0.5 text-xs text-slate-500">
            {student.admissionNumber ||
              "No admission number"}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <StatusSelector
          value={
            record.status ||
            "Present"
          }
          onChange={(status) =>
            onStatusChange(
              student._id,
              status
            )
          }
        />
      </div>

      <input
        type="text"
        value={
          record.remarks || ""
        }
        onChange={(event) =>
          onRemarksChange(
            student._id,
            event.target.value
          )
        }
        placeholder="Optional remarks"
        className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

/* ---------------------------------------
   Status selector
---------------------------------------- */

function StatusSelector({
  value,
  onChange,
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {STATUS_OPTIONS.map(
        (status) => (
          <button
            key={status}
            type="button"
            onClick={() =>
              onChange(status)
            }
            className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
              value === status
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {status}
          </button>
        )
      )}
    </div>
  );
}

/* ---------------------------------------
   Summary card
---------------------------------------- */

function SummaryCard({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

/* ---------------------------------------
   Helpers
---------------------------------------- */

function getStudentName(student) {
  return [
    student.firstName,
    student.middleName,
    student.lastName,
  ]
    .filter(Boolean)
    .join(" ");
}

function getTodayDate() {
  const date =
    new Date();

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function extractList(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (
    Array.isArray(
      response?.data
    )
  ) {
    return response.data;
  }

  if (
    Array.isArray(
      response?.data?.data
    )
  ) {
    return response.data.data;
  }

  if (
    Array.isArray(
      response?.data?.students
    )
  ) {
    return response.data.students;
  }

  if (
    Array.isArray(
      response?.students
    )
  ) {
    return response.students;
  }

  if (
    Array.isArray(
      response?.classes
    )
  ) {
    return response.classes;
  }

  if (
    Array.isArray(
      response?.sessions
    )
  ) {
    return response.sessions;
  }

  return [];
}