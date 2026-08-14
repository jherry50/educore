import { useEffect, useMemo, useState } from "react";

import {
  createSubject,
  deleteSubject,
  getSubjects,
  updateSubject,
} from "../../api/subjectApi";

import { useAuth } from "../../hooks/useAuth";

import SubjectFormModal from "../../components/subjects/SubjectFormModal";

export default function SubjectsPage() {
  const { hasPermission } = useAuth();

  const [subjects, setSubjects] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [section, setSection] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingSubject, setEditingSubject] =
    useState(null);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const canCreate =
    hasPermission("subjects.create");

  const canUpdate =
    hasPermission("subjects.update");

  const canDelete =
    hasPermission("subjects.delete");

  useEffect(() => {
    loadSubjects();
  }, []);

  async function loadSubjects() {
    try {
      setLoading(true);
      setError("");

      const response =
        await getSubjects();

      setSubjects(response.data || []);
    } catch (err) {
      console.error(
        "Failed to load subjects:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load subjects."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSubject(data) {
    try {
      setSaving(true);
      setError("");

      if (editingSubject) {
        const response =
          await updateSubject(
            editingSubject._id,
            data
          );

        setSubjects((current) =>
          current.map((subject) =>
            subject._id ===
            editingSubject._id
              ? response.data
              : subject
          )
        );
      } else {
        const response =
          await createSubject(data);

        setSubjects((current) => [
          response.data,
          ...current,
        ]);
      }

      closeModal();
    } catch (err) {
      console.error(
        "Failed to save subject:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to save subject."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteSubject(
    subject
  ) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${subject.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(subject._id);
      setError("");

      await deleteSubject(subject._id);

      setSubjects((current) =>
        current.filter(
          (item) =>
            item._id !== subject._id
        )
      );
    } catch (err) {
      console.error(
        "Failed to delete subject:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to delete subject."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function openCreateModal() {
    setEditingSubject(null);
    setModalOpen(true);
    setError("");
  }

  function openEditModal(subject) {
    setEditingSubject(subject);
    setModalOpen(true);
    setError("");
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingSubject(null);
  }

  const filteredSubjects =
    useMemo(() => {
      const term =
        search.trim().toLowerCase();

      return subjects.filter(
        (subject) => {
          const matchesSearch =
            !term ||
            subject.name
              ?.toLowerCase()
              .includes(term) ||
            subject.code
              ?.toLowerCase()
              .includes(term);

          const matchesSection =
            !section ||
            subject.section === section;

          const matchesStatus =
            !status ||
            (status === "active"
              ? subject.isActive
              : !subject.isActive);

          return (
            matchesSearch &&
            matchesSection &&
            matchesStatus
          );
        }
      );
    }, [
      subjects,
      search,
      section,
      status,
    ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Subjects
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage the subjects offered by the
            school.
          </p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            + Add Subject
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
            className="ml-4 font-medium hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      {/* Filters */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by subject name or code..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={section}
            onChange={(event) =>
              setSection(event.target.value)
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

      {/* Content */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Subject List
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {filteredSubjects.length}{" "}
                subject
                {filteredSubjects.length ===
                1
                  ? ""
                  : "s"}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : filteredSubjects.length ===
          0 ? (
          <EmptyState
            search={search}
            onCreate={
              canCreate
                ? openCreateModal
                : undefined
          }
          />
        ) : (
          <SubjectTable
            subjects={filteredSubjects}
            canUpdate={canUpdate}
            canDelete={canDelete}
            deletingId={deletingId}
            onEdit={openEditModal}
            onDelete={handleDeleteSubject}
          />
        )}
      </section>

      {/* Modal */}
      <SubjectFormModal
        open={modalOpen}
        subject={editingSubject}
        saving={saving}
        onClose={closeModal}
        onSubmit={handleSaveSubject}
      />
    </div>
  );
}

/* -----------------------------------------
   Subject Table
------------------------------------------ */

function SubjectTable({
  subjects,
  canUpdate,
  canDelete,
  deletingId,
  onEdit,
  onDelete,
}) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Subject
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Code
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Section
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Type
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>

              {(canUpdate || canDelete) && (
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {subjects.map((subject) => (
              <tr
                key={subject._id}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-slate-900">
                      {subject.name}
                    </p>

                    {subject.description && (
                      <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                        {subject.description}
                      </p>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className="rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">
                    {subject.code}
                  </span>
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">
                  {subject.section}
                </td>

                <td className="px-6 py-4">
                  {subject.isCore ? (
                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                      Core
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      Optional
                    </span>
                  )}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      subject.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {subject.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                </td>

                {(canUpdate ||
                  canDelete) && (
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {canUpdate && (
                        <button
                          type="button"
                          onClick={() =>
                            onEdit(subject)
                          }
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          Edit
                        </button>
                      )}

                      {canDelete && (
                        <button
                          type="button"
                          onClick={() =>
                            onDelete(subject)
                          }
                          disabled={
                            deletingId ===
                            subject._id
                          }
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          {deletingId ===
                          subject._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="divide-y divide-slate-200 md:hidden">
        {subjects.map((subject) => (
          <div
            key={subject._id}
            className="space-y-4 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-900">
                  {subject.name}
                </h3>

                <p className="mt-1 font-mono text-xs text-slate-500">
                  {subject.code}
                </p>
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  subject.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {subject.isActive
                  ? "Active"
                  : "Inactive"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-400">
                  Section
                </p>

                <p className="mt-1 text-slate-700">
                  {subject.section}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Type
                </p>

                <p className="mt-1 text-slate-700">
                  {subject.isCore
                    ? "Core"
                    : "Optional"}
                </p>
              </div>
            </div>

            {(canUpdate ||
              canDelete) && (
              <div className="flex gap-2">
                {canUpdate && (
                  <button
                    type="button"
                    onClick={() =>
                      onEdit(subject)
                    }
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
                  >
                    Edit
                  </button>
                )}

                {canDelete && (
                  <button
                    type="button"
                    onClick={() =>
                      onDelete(subject)
                    }
                    disabled={
                      deletingId ===
                      subject._id
                    }
                    className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600"
                  >
                    {deletingId ===
                    subject._id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

/* -----------------------------------------
   Loading
------------------------------------------ */

function LoadingState() {
  return (
    <div className="divide-y divide-slate-100">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="flex animate-pulse items-center gap-6 px-6 py-5"
        >
          <div className="h-4 w-40 rounded bg-slate-200" />
          <div className="h-4 w-16 rounded bg-slate-200" />
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="h-4 w-16 rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

/* -----------------------------------------
   Empty
------------------------------------------ */

function EmptyState({
  search,
  onCreate,
}) {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
        📚
      </div>

      <h3 className="mt-4 font-semibold text-slate-900">
        No subjects found
      </h3>

      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
        {search
          ? "Try changing your search or filters."
          : "Create your first subject to get started."}
      </p>

      {onCreate && !search && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add Subject
        </button>
      )}
    </div>
  );
}