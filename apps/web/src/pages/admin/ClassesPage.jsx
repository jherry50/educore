import { useEffect, useState } from "react";
import {
  Link,
  useSearchParams,
} from "react-router-dom";

import {
  getClasses,
  deleteClass,
} from "../../api/classApi";

export default function ClassesPage() {
  const [classes, setClasses] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [searchParams, setSearchParams] =
    useSearchParams();

  const search =
    searchParams.get("search") || "";

  const section =
    searchParams.get("section") || "";

  async function loadClasses() {
    try {
      setLoading(true);
      setError("");

      const response =
        await getClasses({
          search,
          section,
          isActive: "true",
        });

      setClasses(response.data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load classes."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClasses();
  }, [search, section]);

  function updateSearch(
    name,
    value
  ) {
    const params =
      new URLSearchParams(
        searchParams
      );

    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }

    setSearchParams(params);
  }

  async function handleDelete(id) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this class?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteClass(id);

      await loadClasses();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to delete class."
      );
    }
  }

  return (
    <div className="space-y-6">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Classes
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage primary and secondary school classes.
          </p>
        </div>

        <Link
          to="/admin/classes/new"
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Add Class
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row">

          <input
            type="search"
            value={search}
            onChange={(event) =>
              updateSearch(
                "search",
                event.target.value
              )
            }
            placeholder="Search classes..."
            className="w-full max-w-md rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <select
            value={section}
            onChange={(event) =>
              updateSearch(
                "section",
                event.target.value
              )
            }
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="">
              All Sections
            </option>

            <option value="Primary">
              Primary
            </option>

            <option value="Secondary">
              Secondary
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
            Loading classes...
          </div>
        ) : classes.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium text-slate-900">
              No classes found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Create your first class to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-left text-sm">

              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3">
                    Code
                  </th>

                  <th className="px-6 py-3">
                    Class
                  </th>

                  <th className="px-6 py-3">
                    Section
                  </th>

                  <th className="px-6 py-3">
                    Capacity
                  </th>

                  <th className="px-6 py-3">
                    Class Teacher
                  </th>

                  <th className="px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {classes.map(
                  (schoolClass) => (
                    <tr
                      key={
                        schoolClass._id
                      }
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {
                          schoolClass.code
                        }
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">
                          {
                            schoolClass.name
                          }
                        </p>

                        <p className="text-xs text-slate-500">
                          {
                            schoolClass.level
                          }
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                          {
                            schoolClass.section
                          }
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {
                          schoolClass.capacity
                        }
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {schoolClass.classTeacher
                          ? `${schoolClass.classTeacher.firstName} ${schoolClass.classTeacher.lastName}`
                          : "Not assigned"}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-3">

                          <Link
                            to={`/admin/classes/${schoolClass._id}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View
                          </Link>

                          <Link
                            to={`/admin/classes/${schoolClass._id}/edit`}
                            className="text-slate-600 hover:text-slate-900"
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                schoolClass._id
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