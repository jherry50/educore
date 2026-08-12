import { useEffect, useState } from "react";
import {
  Link,
  useSearchParams,
} from "react-router-dom";

import {
  getStudents,
  deleteStudent,
} from "../../api/studentApi";
import { getClasses } from "../../api/classApi";

export default function StudentsPage() {
  const [students, setStudents] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    classId: "",
    status: "",
    });

  const [searchParams, setSearchParams] =
    useSearchParams();

  const search =
    searchParams.get("search") || "";

  const page = Number(
    searchParams.get("page") || 1
  );

//   async function loadStudents() {
//     try {
//       setLoading(true);
//       setError("");

//       const response =
//         await getStudents({
//           page,
//           limit: 10,
//           search,
//         });

//       setStudents(
//         response.data.students
//       );
//     } catch (error) {
//       setError(
//         error.response?.data?.message ||
//           "Unable to load students."
//       );
//     } finally {
//       setLoading(false);
//     }
//   }
async function loadStudents() {
  try {
    setLoading(true);
    setError("");

    const response = await getStudents({
      search: filters.search,
      classId: filters.classId,
      status: filters.status,
    });

    setStudents(response.data.students || []);
  } catch (error) {
    setError(
      error.response?.data?.message ||
        "Unable to load students."
    );
  } finally {
    setLoading(false);
  }
}

useEffect(() => {
  loadStudents();
    }, [
        filters.search,
        filters.classId,
        filters.status,
]);

//   useEffect(() => {
//     loadStudents();
//   }, [page, search]);

  useEffect(() => {
    async function loadClasses() {
        try {
        setClassesLoading(true);

        const response = await getClasses({
            isActive: "true",
        });

        setClasses(response.data || []);
        } catch (error) {
        console.error(
            "Unable to load classes:",
            error
        );
        } finally {
        setClassesLoading(false);
        }
    }

    loadClasses();
    }, []);

  function handleSearch(event) {
    const value =
      event.target.value;

    setSearchParams({
      ...(value
        ? { search: value }
        : {}),
      page: "1",
    });
  }

  async function handleDelete(id) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this student?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteStudent(id);

      await loadStudents();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to delete student."
      );
    }
  }

  return (
    <div className="space-y-6">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Students
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage student records.
          </p>
        </div>

        <Link
          to="/admin/students/new"
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Add Student
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 p-4">
          <input
            type="search"
            value={filters.search}
            onChange={(event) =>
                setFilters((current) => ({
                ...current,
                search: event.target.value,
                }))
            }
            placeholder="Search by name or admission number..."
            className="w-full max-w-md rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <select
            value={filters.classId}
            onChange={(event) =>
                setFilters((current) => ({
                ...current,
                classId: event.target.value,
                }))
            }
            disabled={classesLoading}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
            <option value="">
                {classesLoading
                ? "Loading classes..."
                : "All Classes"}
            </option>

            {classes.map((schoolClass) => (
                <option
                key={schoolClass._id}
                value={schoolClass._id}
                >
                {schoolClass.name}
                </option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(event) =>
                setFilters((current) => ({
                ...current,
                status: event.target.value,
                }))
            }
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
            <option value="">
                All Statuses
            </option>

            <option value="active">
                Active
            </option>

            <option value="inactive">
                Inactive
            </option>

            <option value="graduated">
                Graduated
            </option>

            <option value="withdrawn">
                Withdrawn
            </option>
          </select>
        </div>

        {error && (
          <div className="m-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading students...
          </div>
        ) : students.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium text-slate-900">
              No students found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Add your first student to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3">
                    Admission No.
                  </th>

                  <th className="px-6 py-3">
                    Student
                  </th>

                  <th className="px-6 py-3">
                    Gender
                  </th>

                  <th className="px-6 py-3">
                    Class
                  </th>

                  <th className="px-6 py-3">
                    Status
                  </th>

                  <th className="px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {students.map(
                  (student) => (
                    <tr
                      key={student._id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {
                          student.admissionNumber
                        }
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">
                          {
                            student.firstName
                          }{" "}
                          {
                            student.lastName
                          }
                        </div>

                        <div className="text-xs text-slate-500">
                          {student.email ||
                            "No email"}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {student.gender}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {student.class?.name ||
                          "Unassigned"}
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                          {
                            student.status
                          }
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <Link
                            to={`/admin/students/${student._id}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View
                          </Link>

                          <Link
                            to={`/admin/students/${student._id}/edit`}
                            className="text-slate-600 hover:text-slate-900"
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                student._id
                              )
                            }
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}