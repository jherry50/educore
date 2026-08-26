import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { getClasses } from "../../api/classApi";
import { getAcademicSessions } from "../../api/academicSessionApi";
import {
  getClassAttendanceStatistics,
} from "../../api/attendanceApi";

export default function ClassAttendancePage() {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const [classes, setClasses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [result, setResult] = useState(null);

  const [filters, setFilters] = useState({
    class:
      searchParams.get("class") || "",
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
        classesResponse,
        sessionsResponse,
      ] = await Promise.all([
        getClasses({
          limit: 500,
        }),
        getAcademicSessions({
          limit: 100,
        }),
      ]);

      setClasses(
        extractList(classesResponse)
      );

      setSessions(
        extractList(sessionsResponse)
      );
    } catch (err) {
      console.error(
        "Failed to load class attendance options:",
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

    if (
      name === "academicSession"
    ) {
      setFilters((current) => ({
        ...current,
        academicSession: value,
        term: "",
      }));

      return;
    }

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSearch() {
    if (!filters.class) {
      setError(
        "Please select a class."
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
        await getClassAttendanceStatistics(
          filters.class,
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
        "Failed to load class attendance:",
        err
      );

      setResult(null);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load class attendance."
      );
    } finally {
      setLoadingStats(false);
    }
  }

  function handleReset() {
    setFilters({
      class: "",
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

  const classInfo =
    result?.class || {};

  const students =
    result?.students || [];

  const lowAttendanceStudents =
    result?.lowAttendanceStudents || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Class Attendance
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Monitor attendance performance
          across an entire class.
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
          {/* Class */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Class
            </label>

            <select
              name="class"
              value={filters.class}
              onChange={handleChange}
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                Select class
              </option>

              {classes.map(
                (item) => (
                  <option
                    key={item._id}
                    value={item._id}
                  >
                    {item.name}
                    {item.code
                      ? ` (${item.code})`
                      : ""}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Session */}
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

          {/* Start */}
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

          {/* End */}
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

          {/* Buttons */}
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

      {/* Dashboard */}
      {result && (
        <>
          {/* Class heading */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              {classInfo.name ||
                "Class Attendance"}
            </h2>

            {classInfo.code && (
              <p className="mt-1 text-sm text-slate-500">
                {classInfo.code}
              </p>
            )}
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <StatCard
              label="Students"
              value={
                    result.totalStudents || 0
                }
            />
            <StatCard
              label="Total Records"
              value={
                statistics.totalRecords ||
                0
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

            <StatCard
              label="Attendance Rate"
              value={`${statistics.attendancePercentage || 0}%`}
            />
          </div>

          {/* Low attendance */}
          {lowAttendanceStudents.length >
            0 && (
            <div className="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm">
              <div className="border-b border-amber-100 bg-amber-50 px-6 py-4">
                <h2 className="font-semibold text-amber-900">
                  Students Requiring Attention
                </h2>

                <p className="mt-1 text-sm text-amber-700">
                  Students with attendance
                  below 75%.
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                {lowAttendanceStudents.map(
                  (item) => (
                    <LowAttendanceRow
                      key={
                        item.student
                          ?._id
                      }
                      item={item}
                    />
                  )
                )}
              </div>
            </div>
          )}

          {/* Student breakdown */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="font-semibold text-slate-900">
                Student Attendance Breakdown
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {students.length} student
                {students.length === 1
                  ? ""
                  : "s"} with attendance
                records.
              </p>
            </div>

            {students.length === 0 ? (
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
                          Student
                        </th>

                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Admission No.
                        </th>

                        <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Present
                        </th>

                        <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Absent
                        </th>

                        <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Late
                        </th>

                        <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Excused
                        </th>

                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Rate
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {students.map(
                        (item) => (
                          <StudentRow
                            key={
                              item.student
                                ?._id
                            }
                            item={item}
                          />
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile */}
                <div className="space-y-3 p-4 md:hidden">
                  {students.map(
                    (item) => (
                      <StudentCard
                        key={
                          item.student
                            ?._id
                        }
                        item={item}
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

function StudentRow({
  item,
}) {
  const student =
    item.student || {};

  return (
    <tr>
      <td className="px-6 py-4">
        <p className="font-medium text-slate-900">
          {getStudentName(student)}
        </p>
      </td>

      <td className="px-6 py-4 text-sm text-slate-500">
        {student.admissionNumber ||
          "—"}
      </td>

      <td className="px-6 py-4 text-center text-sm text-green-700">
        {item.present || 0}
      </td>

      <td className="px-6 py-4 text-center text-sm text-red-700">
        {item.absent || 0}
      </td>

      <td className="px-6 py-4 text-center text-sm text-yellow-700">
        {item.late || 0}
      </td>

      <td className="px-6 py-4 text-center text-sm text-blue-700">
        {item.excused || 0}
      </td>

      <td className="px-6 py-4 text-right">
        <AttendanceRate
          value={
            item.attendancePercentage ||
            0
          }
        />
      </td>
    </tr>
  );
}

function StudentCard({
  item,
}) {
  const student =
    item.student || {};

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-slate-900">
            {getStudentName(student)}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {student.admissionNumber ||
              "No admission number"}
          </p>
        </div>

        <AttendanceRate
          value={
            item.attendancePercentage ||
            0
          }
        />
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        <Metric
          label="Present"
          value={item.present}
        />

        <Metric
          label="Absent"
          value={item.absent}
        />

        <Metric
          label="Late"
          value={item.late}
        />

        <Metric
          label="Excused"
          value={item.excused}
        />
      </div>
    </div>
  );
}

function LowAttendanceRow({
  item,
}) {
  const student =
    item.student || {};

  return (
    <div className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium text-slate-900">
          {getStudentName(student)}
        </p>

        <p className="text-xs text-slate-500">
          {student.admissionNumber ||
            "No admission number"}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-500">
          {item.absent || 0} absent
        </span>

        <AttendanceRate
          value={
            item.attendancePercentage ||
            0
          }
        />
      </div>
    </div>
  );
}

function AttendanceRate({
  value,
}) {
  let className =
    "bg-green-50 text-green-700 border-green-200";

  if (value < 75) {
    className =
      "bg-red-50 text-red-700 border-red-200";
  } else if (value < 85) {
    className =
      "bg-yellow-50 text-yellow-700 border-yellow-200";
  }

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      {value}%
    </span>
  );
}

function Metric({
  label,
  value,
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-2 text-center">
      <p className="text-[10px] uppercase text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-700">
        {value || 0}
      </p>
    </div>
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

  return [];
}