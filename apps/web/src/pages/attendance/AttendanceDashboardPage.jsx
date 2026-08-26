import { useEffect, useState } from "react";
import {
  getAttendanceDashboard,
} from "../../api/attendanceApi";

export default function AttendanceDashboardPage() {
  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadDashboard(
    filters = {}
  ) {
    try {
      setLoading(true);
      setError("");

      const response =
        await getAttendanceDashboard(
          filters
        );

      setData(
        response?.data || response
      );
    } catch (err) {
      console.error(
        "Attendance dashboard error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load attendance dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-sm text-slate-500">
          Loading attendance dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const {
    summary,
    today,
    classPerformance = [],
    lowAttendanceStudents = [],
  } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Attendance Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Monitor attendance performance
          across the school.
        </p>
      </div>

      {/* Today's summary */}
      <section>
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Today's Attendance
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <DashboardStat
            label="Present"
            value={today.present}
            variant="success"
          />

          <DashboardStat
            label="Absent"
            value={today.absent}
            variant="danger"
          />

          <DashboardStat
            label="Late"
            value={today.late}
            variant="warning"
          />

          <DashboardStat
            label="Excused"
            value={today.excused}
            variant="info"
          />
        </div>
      </section>

      {/* Overall */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-1">
          <p className="text-sm font-medium text-slate-500">
            Overall Attendance Rate
          </p>

          <p className="mt-3 text-4xl font-bold text-slate-900">
            {summary.attendancePercentage ||
              0}
            %
          </p>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{
                width: `${Math.min(
                  summary.attendancePercentage ||
                    0,
                  100
                )}%`,
              }}
            />
          </div>
        </div>

        <DashboardStat
          label="Total Present"
          value={summary.present}
          variant="success"
        />

        <DashboardStat
          label="Total Absent"
          value={summary.absent}
          variant="danger"
        />
      </section>

      {/* Class performance */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold text-slate-900">
            Class Performance
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Attendance performance by class.
          </p>
        </div>

        {classPerformance.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            No class attendance data available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Class
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

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Attendance
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {classPerformance.map(
                  (item) => (
                    <tr
                      key={
                        item.class?._id
                      }
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">
                          {item.class?.name ||
                            "Unknown"}
                        </p>

                        {item.class
                          ?.code && (
                          <p className="text-xs text-slate-500">
                            {
                              item.class
                                .code
                            }
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center text-sm text-green-700">
                        {item.present}
                      </td>

                      <td className="px-6 py-4 text-center text-sm text-red-700">
                        {item.absent}
                      </td>

                      <td className="px-6 py-4 text-center text-sm text-yellow-700">
                        {item.late}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <AttendanceRate
                          value={
                            item.attendancePercentage
                          }
                        />
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Students requiring attention */}
      <section className="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm">
        <div className="border-b border-amber-100 bg-amber-50 px-6 py-4">
          <h2 className="font-semibold text-amber-900">
            Students Requiring Attention
          </h2>

          <p className="mt-1 text-sm text-amber-700">
            Students with attendance below
            75%.
          </p>
        </div>

        {lowAttendanceStudents.length ===
        0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            No students currently require
            attendance attention.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {lowAttendanceStudents.map(
              (item) => (
                <div
                  key={
                    item.student?._id
                  }
                  className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {getStudentName(
                        item.student
                      )}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {item.student
                        ?.admissionNumber ||
                        "No admission number"}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500">
                      {item.absent} absent
                    </span>

                    <AttendanceRate
                      value={
                        item.attendancePercentage
                      }
                    />
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function DashboardStat({
  label,
  value,
  variant = "default",
}) {
  const variants = {
    default:
      "border-slate-200",

    success:
      "border-green-200",

    danger:
      "border-red-200",

    warning:
      "border-yellow-200",

    info:
      "border-blue-200",
  };

  return (
    <div
      className={`rounded-xl border bg-white p-5 shadow-sm ${variants[variant]}`}
    >
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-slate-900">
        {value || 0}
      </p>
    </div>
  );
}

function AttendanceRate({
  value = 0,
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

function getStudentName(
  student
) {
  return [
    student?.firstName,
    student?.middleName,
    student?.lastName,
  ]
    .filter(Boolean)
    .join(" ");
}