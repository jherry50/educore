import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {hasPermission} from "../../utils/permissions";
import { useAuth } from "../../hooks/useAuth";

import {
  getTeachers,
  deleteTeacher,
} from "../../api/teacherApi";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  const [filters, setFilters] = useState({
    search: "",
    department: "",
    employmentStatus: "",
  });

  async function loadTeachers() {
    try {
      setLoading(true);
      setError("");

      const response = await getTeachers({
        search: filters.search,
        department: filters.department,
        employmentStatus:
          filters.employmentStatus,
      });

      setTeachers(response.data || []);
    } catch (error) {
      console.error(
        "Failed to load teachers:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load teachers."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeachers();
  }, [
    filters.search,
    filters.department,
    filters.employmentStatus,
  ]);

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this teacher?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteTeacher(id);

      await loadTeachers();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to delete teacher."
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Teachers
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage teachers and staff information.
          </p>
        </div>

        {hasPermission(user,"teachers.create") && (
          <Link
            to="/admin/teachers/new"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Add Teacher
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label
              htmlFor="teacher-search"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Search
            </label>

            <input
              id="teacher-search"
              type="text"
              value={filters.search}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  search: event.target.value,
                }))
              }
              placeholder="Name, email or staff ID..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="teacher-department"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Department
            </label>

            <input
              id="teacher-department"
              type="text"
              value={filters.department}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  department: event.target.value,
                }))
              }
              placeholder="e.g. Mathematics"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="teacher-status"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Employment Status
            </label>

            <select
              id="teacher-status"
              value={filters.employmentStatus}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  employmentStatus:
                    event.target.value,
                }))
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                All statuses
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>

              <option value="on_leave">
                On Leave
              </option>

              <option value="resigned">
                Resigned
              </option>

              <option value="terminated">
                Terminated
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Teacher
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Staff ID
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Department
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Qualification
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    Loading teachers...
                  </td>
                </tr>
              ) : teachers.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    No teachers found.
                  </td>
                </tr>
              ) : (
                teachers.map((teacher) => {
                  const user = teacher.user;

                  return (
                    <tr
                      key={teacher._id}
                      className="hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="font-medium text-slate-900">
                          {user?.firstName}{" "}
                          {user?.lastName}
                        </div>

                        <div className="text-sm text-slate-500">
                          {user?.email}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-700">
                        {teacher.staffId}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                        {teacher.department || "—"}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                        {teacher.qualification || "—"}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                          {teacher.employmentStatus}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/admin/teachers/${teacher._id}`}
                            className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                          >
                            View
                          </Link>

                          <Link
                            to={`/admin/teachers/${teacher._id}/edit`}
                            className="rounded-md px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                teacher._id
                              )
                            }
                            className="rounded-md px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}