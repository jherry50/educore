import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getTeachers,
} from "../../api/teacherApi";

import {
  getSubjects,
} from "../../api/subjectApi";

import {
  getClasses,
} from "../../api/classApi";

import {
  createTeacherAssignment,
  deleteTeacherAssignment,
  getTeacherAssignments,
  updateTeacherAssignment,
} from "../../api/teacherAssignmentApi";
import {
  getAcademicSessions,
} from "../../api/academicSessionApi";

import { useAuth } from "../../hooks/useAuth";

import TeacherAssignmentFormModal from "../../components/teacherAssignments/TeacherAssignmentFormModal";

export default function TeacherAssignmentsPage() {
  const { hasPermission } = useAuth();

  const [assignments, setAssignments] =
    useState([]);

  const [teachers, setTeachers] =
    useState([]);

  const [subjects, setSubjects] =
    useState([]);

  const [classes, setClasses] =
    useState([]);
  const [
    academicSessions,
    setAcademicSessions,
    ] = useState([]);

  const [
    loadingSessions,
    setLoadingSessions,
    ] = useState(false);

  const [loading, setLoading] =
    useState(true);

  const [loadingOptions, setLoadingOptions] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [term, setTerm] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [session, setSession] =
    useState("");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [
    editingAssignment,
    setEditingAssignment,
  ] = useState(null);

  const canView =
    hasPermission("teachers.view");

  const canManage =
    hasPermission("teachers.update");

  useEffect(() => {
    loadAssignments();
    loadAcademicSessions();
  }, []);

  async function loadAssignments() {
    try {
      setLoading(true);
      setError("");

      const response =
        await getTeacherAssignments();

      setAssignments(
        response.data || []
      );
    } catch (err) {
      console.error(
        "Failed to load teacher assignments:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load teacher assignments."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadAcademicSessions() {
  try {
    setLoadingSessions(true);

    const response =
      await getAcademicSessions({
        limit: 100,
      });

    const sessions =
      response?.data ||
      response?.sessions ||
      response ||
      [];

    setAcademicSessions(
      Array.isArray(sessions)
        ? sessions
        : []
    );
  } catch (err) {
    console.error(
      "Failed to load academic sessions:",
      err
    );

    setAcademicSessions([]);
  } finally {
    setLoadingSessions(false);
  }
}

  async function loadOptions() {
    try {
      setLoadingOptions(true);
      setError("");

      const [
        teachersResponse,
        subjectsResponse,
        classesResponse,
      ] = await Promise.all([
        getTeachers({
          isActive: true,
        }),

        getSubjects({
          isActive: true,
        }),

        getClasses({
          isActive: true,
        }),
      ]);

      setTeachers(
        teachersResponse.data || []
      );

      setSubjects(
        subjectsResponse.data || []
      );

      setClasses(
        classesResponse.data || []
      );
    } catch (err) {
      console.error(
        "Failed to load assignment options:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load teachers, subjects or classes."
      );
    } finally {
      setLoadingOptions(false);
    }
  }

  async function openCreateModal() {
    setEditingAssignment(null);
    setModalOpen(true);
    setError("");

    await loadOptions();
  }

  async function openEditModal(
    assignment
  ) {
    setEditingAssignment(assignment);
    setModalOpen(true);
    setError("");

    await loadOptions();
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingAssignment(null);
  }

//   async function handleSave(data) {
//     try {
//       setSaving(true);
//       setError("");

//       if (editingAssignment) {
//         const response =
//           await updateTeacherAssignment(
//             editingAssignment._id,
//             data
//           );

//         setAssignments((current) =>
//           current.map((item) =>
//             item._id ===
//             editingAssignment._id
//               ? response.data
//               : item
//           )
//         );
//       } else {
//         const response =
//           await createTeacherAssignment(
//             data
//           );

//         setAssignments((current) => [
//           response.data,
//           ...current,
//         ]);
//       }

//       closeModal();
//     } catch (err) {
//       console.error(
//         "Failed to save assignment:",
//         err
//       );

//       setError(
//         err.response?.data?.message ||
//           "Unable to save teacher assignment."
//       );
//     } finally {
//       setSaving(false);
//     }
//   }
async function handleSave(data) {
  try {
    setSaving(true);
    setError("");

    if (editingAssignment) {
      await updateTeacherAssignment(
        editingAssignment._id,
        data
      );
    } else {
      await createTeacherAssignment(data);
    }

    await loadAssignments();

    closeModal();
  } catch (err) {
    console.error(
      "Failed to save assignment:",
      err
    );

    setError(
      err.response?.data?.message ||
        "Unable to save teacher assignment."
    );
  } finally {
    setSaving(false);
  }
}

  async function handleDelete(
    assignment
  ) {
    const teacherName =
      getAssignmentTeacherName(
        assignment
      );

    const subjectName =
      assignment.subject?.name ||
      "this subject";

    const className =
      assignment.class?.name ||
      "this class";

    const confirmed =
      window.confirm(
        `Remove ${teacherName}'s ${subjectName} assignment for ${className}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        assignment._id
      );

      setError("");

      await deleteTeacherAssignment(
        assignment._id
      );

      setAssignments((current) =>
        current.filter(
          (item) =>
            item._id !== assignment._id
        )
      );
    } catch (err) {
      console.error(
        "Failed to delete assignment:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to delete assignment."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filteredAssignments =
    useMemo(() => {
      const searchTerm =
        search.trim().toLowerCase();

      return assignments.filter(
        (assignment) => {
          const teacherName =
            getAssignmentTeacherName(
              assignment
            ).toLowerCase();

          const subjectName =
            assignment.subject?.name?.toLowerCase() ||
            "";

          const subjectCode =
            assignment.subject?.code?.toLowerCase() ||
            "";

          const className =
            assignment.class?.name?.toLowerCase() ||
            "";

          const matchesSearch =
            !searchTerm ||
            teacherName.includes(
              searchTerm
            ) ||
            subjectName.includes(
              searchTerm
            ) ||
            subjectCode.includes(
              searchTerm
            ) ||
            className.includes(
              searchTerm
            );

          const matchesTerm =
            !term ||
            assignment.term === term;

          const matchesSession =
            !session ||
            assignment.academicSession?._id ===
                session;

          const matchesStatus =
            !status ||
            (status === "active"
              ? assignment.isActive
              : !assignment.isActive);

          return (
            matchesSearch &&
            matchesTerm &&
            matchesSession &&
            matchesStatus
          );
        }
      );
    }, [
      assignments,
      search,
      term,
      session,
      status,
    ]);

  if (!canView) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        You do not have permission to view
        teacher assignments.
      </div>
    );
  }

//   const sessions = [
//     ...new Set(
//       assignments
//         .map(
//           (item) =>
//             item.academicSession
//         )
//         .filter(Boolean)
//     ),
//   ];


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Teacher Assignments
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Assign teachers to subjects and
            classes.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            + Assign Teacher
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="ml-4 font-medium"
          >
            ×
          </button>
        </div>
      )}

      {/* Filters */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-4">
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search teacher, subject or class..."
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <select
            value={session}
            onChange={(event) =>
                setSession(event.target.value)
            }
            disabled={loadingSessions}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none disabled:bg-slate-100"
            >
            <option value="">
                All Sessions
            </option>

            {academicSessions.map(
                (academicSession) => (
                <option
                    key={academicSession._id}
                    value={academicSession._id}
                >
                    {academicSession.name}
                </option>
                )
            )}
          </select>

          {/* <select
            value={session}
            onChange={(event) =>
              setSession(event.target.value)
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none"
          >
            <option value="">
              All Sessions
            </option>

            {sessions.map(
              (academicSession) => (
                <option
                  key={academicSession._id}
                  value={academicSession._id}
                >
                  {academicSession.name}
                </option>
              )
            )}
          </select> */}

          <select
            value={term}
            onChange={(event) =>
              setTerm(event.target.value)
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none"
          >
            <option value="">
              All Terms
            </option>

            <option value="First Term">
              First Term
            </option>

            <option value="Second Term">
              Second Term
            </option>

            <option value="Third Term">
              Third Term
            </option>
          </select>

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none"
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
          </select>
        </div>
      </section>

      {/* Table */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold text-slate-900">
            Assignment List
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {filteredAssignments.length}{" "}
            assignment
            {filteredAssignments.length ===
            1
              ? ""
              : "s"}
          </p>
        </div>

        {loading ? (
          <LoadingState />
        ) : filteredAssignments.length ===
          0 ? (
          <EmptyState
            canManage={canManage}
            onCreate={openCreateModal}
          />
        ) : (
          <AssignmentTable
            assignments={filteredAssignments}
            canManage={canManage}
            deletingId={deletingId}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
        )}
      </section>

      <TeacherAssignmentFormModal
        open={modalOpen}
        assignment={editingAssignment}
        teachers={teachers}
        subjects={subjects}
        classes={classes}
        loadingOptions={loadingOptions}
        saving={saving}
        onClose={closeModal}
        onSubmit={handleSave}
      />
    </div>
  );
}

function AssignmentTable({
  assignments,
  canManage,
  deletingId,
  onEdit,
  onDelete,
}) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Teacher
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Subject
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

              {canManage && (
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {assignments.map(
              (assignment) => (
                <tr
                  key={assignment._id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">
                      {getAssignmentTeacherName(
                        assignment
                      )}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-800">
                      {assignment.subject
                        ?.name ||
                        "—"}
                    </p>

                    <p className="mt-1 font-mono text-xs text-slate-400">
                      {assignment.subject
                        ?.code || ""}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-700">
                    {assignment.class
                      ?.name || "—"}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {
                      assignment.academicSession?.name || "—"
                    }
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {assignment.term}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        assignment.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {assignment.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>

                  {canManage && (
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onEdit(
                              assignment
                            )
                          }
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          disabled={
                            deletingId ===
                            assignment._id
                          }
                          onClick={() =>
                            onDelete(
                              assignment
                            )
                          }
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          {deletingId ===
                          assignment._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="divide-y divide-slate-200 md:hidden">
        {assignments.map(
          (assignment) => (
            <div
              key={assignment._id}
              className="space-y-4 p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {getAssignmentTeacherName(
                      assignment
                    )}
                  </h3>

                  <p className="mt-1 text-sm text-slate-600">
                    {assignment.subject
                      ?.name ||
                      "—"}{" "}
                    →{" "}
                    {assignment.class
                      ?.name || "—"}
                  </p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    assignment.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {assignment.isActive
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-400">
                    Session
                  </p>

                  <p className="mt-1 text-slate-700">
                    {
                      assignment.academicSession?.name || "—"
                    }
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Term
                  </p>

                  <p className="mt-1 text-slate-700">
                    {assignment.term}
                  </p>
                </div>
              </div>

              {canManage && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onEdit(
                        assignment
                      )
                    }
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    disabled={
                      deletingId ===
                      assignment._id
                    }
                    onClick={() =>
                      onDelete(
                        assignment
                      )
                    }
                    className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600"
                  >
                    {deletingId ===
                    assignment._id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </>
  );
}

function getAssignmentTeacherName(
  assignment
) {
  const teacher = assignment.teacher;

  if (!teacher) {
    return "Unknown Teacher";
  }

  if (teacher.user) {
    return [
      teacher.user.firstName,
      teacher.user.lastName,
    ]
      .filter(Boolean)
      .join(" ");
  }

  return [
    teacher.firstName,
    teacher.lastName,
  ]
    .filter(Boolean)
    .join(" ");
}

function LoadingState() {
  return (
    <div className="divide-y divide-slate-100">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="flex animate-pulse items-center gap-6 px-6 py-5"
        >
          <div className="h-4 w-32 rounded bg-slate-200" />
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="h-4 w-20 rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  canManage,
  onCreate,
}) {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
        👨‍🏫
      </div>

      <h3 className="mt-4 font-semibold text-slate-900">
        No teacher assignments found
      </h3>

      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
        Assign teachers to subjects and
        classes to get started.
      </p>

      {canManage && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Assign Teacher
        </button>
      )}
    </div>
  );
}