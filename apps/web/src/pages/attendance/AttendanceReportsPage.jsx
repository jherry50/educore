import { useEffect, useState } from "react";

import { getClasses } from "../../api/classApi";
import { getStudents } from "../../api/studentApi";
import {
  getAcademicSessions,
} from "../../api/academicSessionApi";

import {
  getAttendanceReport,
} from "../../api/attendanceApi";

export default function AttendanceReportsPage() {
  const [classes, setClasses] =
    useState([]);

  const [students, setStudents] =
    useState([]);

  const [sessions, setSessions] =
    useState([]);

  const [report, setReport] =
    useState(null);

  const [filters, setFilters] =
    useState({
      reportType: "class",
      classId: "",
      studentId: "",
      academicSession: "",
      term: "",
      startDate: "",
      endDate: "",
      status: "",
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadOptions();
  }, []);

  async function loadOptions() {
    try {
      const [
        classesResponse,
        studentsResponse,
        sessionsResponse,
      ] = await Promise.all([
        getClasses({
          limit: 500,
        }),

        getStudents({
          limit: 500,
        }),

        getAcademicSessions({
          limit: 100,
        }),
      ]);

      setClasses(
        extractList(classesResponse)
      );

      setStudents(
        extractList(studentsResponse)
      );

      setSessions(
        extractList(sessionsResponse)
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load report filters."
      );
    }
  }

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function generateReport() {
    try {
      setLoading(true);
      setError("");

      const params = {
        reportType:
          filters.reportType,
      };

      Object.entries(filters)
        .filter(
          ([key]) =>
            key !== "reportType"
        )
        .forEach(
          ([key, value]) => {
            if (value) {
              params[key] = value;
            }
          }
        );

      const response =
        await getAttendanceReport(
          params
        );

      setReport(
        response?.data || response
      );
    } catch (err) {
      setReport(null);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to generate report."
      );
    } finally {
      setLoading(false);
    }
  }

  const summary =
    report?.summary || {};

  const records =
    report?.records || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Attendance Reports
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Generate attendance reports using
          custom filters.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <SelectField
            label="Report Type"
            name="reportType"
            value={
              filters.reportType
            }
            onChange={handleChange}
          >
            <option value="class">
              Class Attendance
            </option>

            <option value="student">
              Student Attendance
            </option>

            <option value="daily">
              Daily Attendance
            </option>
          </SelectField>

          <SelectField
            label="Class"
            name="classId"
            value={filters.classId}
            onChange={handleChange}
          >
            <option value="">
              All classes
            </option>

            {classes.map((item) => (
              <option
                key={item._id}
                value={item._id}
              >
                {item.name}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Student"
            name="studentId"
            value={
              filters.studentId
            }
            onChange={handleChange}
          >
            <option value="">
              All students
            </option>

            {students.map((student) => (
              <option
                key={student._id}
                value={student._id}
              >
                {getStudentName(student)}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Academic Session"
            name="academicSession"
            value={
              filters.academicSession
            }
            onChange={handleChange}
          >
            <option value="">
              All sessions
            </option>

            {sessions.map((session) => (
              <option
                key={session._id}
                value={session._id}
              >
                {session.name}
              </option>
            ))}
          </SelectField>

          <InputField
            label="Start Date"
            name="startDate"
            type="date"
            value={
              filters.startDate
            }
            onChange={handleChange}
          />

          <InputField
            label="End Date"
            name="endDate"
            type="date"
            value={
              filters.endDate
            }
            onChange={handleChange}
          />

          <SelectField
            label="Status"
            name="status"
            value={filters.status}
            onChange={handleChange}
          >
            <option value="">
              All statuses
            </option>

            <option value="Present">
              Present
            </option>

            <option value="Absent">
              Absent
            </option>

            <option value="Late">
              Late
            </option>

            <option value="Excused">
              Excused
            </option>
          </SelectField>

          <div className="flex items-end">
            <button
              type="button"
              onClick={
                generateReport
              }
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? "Generating..."
                : "Generate Report"}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {report && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <SummaryCard
              label="Total"
              value={summary.total}
            />

            <SummaryCard
              label="Present"
              value={summary.present}
            />

            <SummaryCard
              label="Absent"
              value={summary.absent}
            />

            <SummaryCard
              label="Late"
              value={summary.late}
            />

            <SummaryCard
              label="Rate"
              value={`${summary.attendancePercentage}%`}
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Attendance Records
                </h2>

                <p className="text-sm text-slate-500">
                  {records.length} record
                  {records.length === 1
                    ? ""
                    : "s"}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    window.print()
                  }
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Print
                </button>
              </div>
            </div>

            {records.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-slate-500">
                No attendance records found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Date
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Student
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Class
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Remarks
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {records.map(
                      (record) => (
                        <tr
                          key={
                            record._id
                          }
                        >
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {formatDate(
                              record.date
                            )}
                          </td>

                          <td className="px-6 py-4 text-sm font-medium text-slate-900">
                            {getStudentName(
                              record.student
                            )}
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-600">
                            {
                              record
                                .class
                                ?.name
                            }
                          </td>

                          <td className="px-6 py-4">
                            <StatusBadge
                              status={
                                record.status
                              }
                            />
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-500">
                            {record.remarks ||
                              "—"}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  children,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        {children}
      </select>
    </div>
  );
}

function InputField({
  label,
  name,
  type,
  value,
  onChange,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

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
        {value || 0}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}) {
  const classes = {
    Present:
      "bg-green-50 text-green-700 border-green-200",

    Absent:
      "bg-red-50 text-red-700 border-red-200",

    Late:
      "bg-yellow-50 text-yellow-700 border-yellow-200",

    Excused:
      "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
        classes[status] ||
        "bg-slate-50 text-slate-600 border-slate-200"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
}

function getStudentName(
  student
) {
  if (!student) {
    return "—";
  }

  return [
    student.firstName,
    student.middleName,
    student.lastName,
  ]
    .filter(Boolean)
    .join(" ");
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function extractList(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
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

  return [];
}