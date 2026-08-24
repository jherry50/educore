import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { getStudents } from "../../api/studentApi";
import { getAcademicSessions } from "../../api/academicSessionApi";
import {
  getStudentAttendanceStatistics,
} from "../../api/attendanceApi";

export default function StudentAttendancePage() {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [result, setResult] = useState(null);

  const [filters, setFilters] = useState({
    student:
      searchParams.get("student") || "",
    academicSession:
      searchParams.get("academicSession") || "",
    term:
      searchParams.get("term") || "",
    startDate:
      searchParams.get("startDate") || "",
    endDate:
      searchParams.get("endDate") || "",
  });

  const [loading, setLoading] =
    useState(true);

  const [loadingStats, setLoadingStats] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadOptions();
  }, []);

  async function loadOptions() {
    try {
      setLoading(true);
      setError("");

      const [
        studentsResponse,
        sessionsResponse,
      ] = await Promise.all([
        getStudents({
          limit: 500,
        }),
        getAcademicSessions({
          limit: 100,
        }),
      ]);

      setStudents(
        extractList(studentsResponse)
      );

      setSessions(
        extractList(sessionsResponse)
      );
    } catch (err) {
      console.error(
        "Failed to load student attendance options:",
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

  const selectedSession = useMemo(
    () =>
      sessions.find(
        (session) =>
          session._id ===
          filters.academicSession
      ),
    [
      sessions,
      filters.academicSession,
    ]
  );

  const terms =
    selectedSession?.terms || [];

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));

    if (name === "academicSession") {
      setFilters((current) => ({
        ...current,
        academicSession: value,
        term: "",
      }));
    }
  }

  async function handleSearch() {
    if (!filters.student) {
      setError(
        "Please select a student."
      );
      return;
    }

    try {
      setLoadingStats(true);
      setError("");

      const params = {};

      if (filters.academicSession) {
        params.academicSession =
          filters.academicSession;
      }

      if (filters.term) {
        params.term =
          filters.term;
      }

      if (filters.startDate) {
        params.startDate =
          filters.startDate;
      }

      if (filters.endDate) {
        params.endDate =
          filters.endDate;
      }

      const response =
        await getStudentAttendanceStatistics(
          filters.student,
          params
        );

      setResult(
        response?.data || response
      );

      setSearchParams(
        Object.fromEntries(
          Object.entries(filters).filter(
            ([, value]) => value
          )
        )
      );
    } catch (err) {
      console.error(
        "Failed to load student attendance:",
        err
      );

      setResult(null);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load student attendance."
      );
    } finally {
      setLoadingStats(false);
    }
  }

  function handleReset() {
    setFilters({
      student: "",
      academicSession: "",
      term: "",
      startDate: "",
      endDate: "",
    });

    setResult(null);
    setError("");
    setSearchParams({});
  }

  const statistics =
    result?.statistics || {};

  const student =
    result?.student || {};

  const records =
    result?.records || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Student Attendance
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View detailed attendance records
          and attendance performance for a
          student.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* Student */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Student
            </label>

            <select
              name="student"
              value={filters.student}
              onChange={handleChange}
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                Select student
              </option>

              {students.map(
                (item) => (
                  <option
                    key={item._id}
                    value={item._id}
                  >
                    {getStudentName(item)}
                    {item.admissionNumber
                      ? ` — ${item.admissionNumber}`
                      : ""}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Academic Session */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Academic Session
            </label>

            <select
              name="academicSession"
              value={
                filters.academicSession
              }
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                All sessions
              </option>

              {sessions.map(
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
              name="term"
              value={filters.term}
              onChange={handleChange}
              disabled={
                !filters.academicSession
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
            >
              <option value="">
                All terms
              </option>

              {terms.map((term) => (
                <option
                  key={
                    term._id ||
                    term.name
                  }
                  value={term.name}
                >
                  {term.name}
                </option>
              ))}
            </select>
          </div>

          {/* Start date */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Start Date
            </label>

            <input
              type="date"
              name="startDate"
              value={
                filters.startDate
              }
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* End date */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              End Date
            </label>

            <input
              type="date"
              name="endDate"
              value={
                filters.endDate
              }
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Actions */}
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={handleSearch}
              disabled={loadingStats}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loadingStats
                ? "Loading..."
                : "View Attendance"}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Student information */}
      {result && (
        <>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {getStudentName(student)}
                </h2>

                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                  <span>
                    {student.admissionNumber ||
                      "No admission number"}
                  </span>

                  {student.class?.name && (
                    <span>
                      {student.class.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 px-6 py-4 text-center">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Attendance Rate
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {statistics.attendancePercentage ??
                    0}
                  %
                </p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <StatCard
              label="Total"
              value={
                statistics.total || 0
              }
            />

            <StatCard
              label="Present"
              value={
                statistics.present || 0
            }
            />

            <StatCard
              label="Absent"
              value={
                statistics.absent || 0
              }
            />

            <StatCard
              label="Late"
              value={
                statistics.late || 0
              }
            />

            <StatCard
              label="Excused"
              value={
                statistics.excused || 0
              }
            />
          </div>

          {/* Attendance history */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="font-semibold text-slate-900">
                Attendance History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {records.length} attendance
                record
                {records.length === 1
                  ? ""
                  : "s"} found.
              </p>
            </div>

            {records.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-slate-500">
                No attendance records found
                for the selected filters.
              </div>
            ) : (
              <>
                {/* Desktop */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="min-w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Date
                        </th>

                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Class
                        </th>

                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Session
                        </th>

                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Term
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
                          <AttendanceRow
                            key={
                              record._id
                            }
                            record={
                              record
                            }
                          />
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile */}
                <div className="space-y-3 p-4 md:hidden">
                  {records.map(
                    (record) => (
                      <AttendanceCard
                        key={
                          record._id
                        }
                        record={
                          record
                        }
                      />
                    )
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
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

function AttendanceRow({
  record,
}) {
  return (
    <tr>
      <td className="px-6 py-4 text-sm text-slate-600">
        {formatDate(record.date)}
      </td>

      <td className="px-6 py-4 text-sm text-slate-600">
        {record.class?.name || "—"}
      </td>

      <td className="px-6 py-4 text-sm text-slate-600">
        {record.academicSession?.name ||
          "—"}
      </td>

      <td className="px-6 py-4 text-sm text-slate-600">
        {record.term || "—"}
      </td>

      <td className="px-6 py-4">
        <StatusBadge
          status={record.status}
        />
      </td>

      <td className="px-6 py-4 text-sm text-slate-500">
        {record.remarks || "—"}
      </td>
    </tr>
  );
}

function AttendanceCard({
  record,
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-slate-900">
            {formatDate(record.date)}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {record.class?.name ||
              "No class"}
          </p>
        </div>

        <StatusBadge
          status={record.status}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-slate-400">
            Session
          </p>

          <p className="text-slate-700">
            {record.academicSession
              ?.name || "—"}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-400">
            Term
          </p>

          <p className="text-slate-700">
            {record.term || "—"}
          </p>
        </div>
      </div>

      {record.remarks && (
        <div className="mt-3">
          <p className="text-xs text-slate-400">
            Remarks
          </p>

          <p className="text-sm text-slate-600">
            {record.remarks}
          </p>
        </div>
      )}
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