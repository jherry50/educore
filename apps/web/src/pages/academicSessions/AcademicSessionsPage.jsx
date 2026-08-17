import {
  useEffect,
  useState,
} from "react";

import {
  activateAcademicSession,
  completeAcademicSession,
  createAcademicSession,
  deleteAcademicSession,
  getAcademicSessions,
  updateAcademicSession,
} from "../../api/academicSessionApi";

import { useAuth } from "../../hooks/useAuth";

import AcademicSessionFormModal from "../../components/academicSessions/AcademicSessionFormModal";

export default function AcademicSessionsPage() {
  const { hasPermission } = useAuth();

  const [sessions, setSessions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [actionId, setActionId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [
    editingSession,
    setEditingSession,
  ] = useState(null);

  const canView =
    hasPermission("settings.view");

  const canManage =
    hasPermission("settings.update");

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    try {
      setLoading(true);
      setError("");

      const response =
        await getAcademicSessions();

      setSessions(
        response.data || []
      );
    } catch (err) {
      console.error(
        "Failed to load academic sessions:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load academic sessions."
      );
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingSession(null);
    setError("");
    setModalOpen(true);
  }

  function openEditModal(session) {
    setEditingSession(session);
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingSession(null);
  }

  async function handleSave(data) {
    try {
      setSaving(true);
      setError("");

      if (editingSession) {
        const response =
          await updateAcademicSession(
            editingSession._id,
            data
          );

        setSessions((current) =>
          current.map((session) =>
            session._id ===
            editingSession._id
              ? response.data
              : session
          )
        );
      } else {
        const response =
          await createAcademicSession(
            data
          );

        setSessions((current) => [
          response.data,
          ...current,
        ]);
      }

      closeModal();
    } catch (err) {
      console.error(
        "Failed to save academic session:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to save academic session."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleActivate(session) {
    const confirmed =
      window.confirm(
        `Set ${session.name} as the active academic session?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionId(session._id);
      setError("");

      const response =
        await activateAcademicSession(
          session._id
        );

      setSessions((current) =>
        current.map((item) => ({
          ...item,
          isActive:
            item._id ===
            response.data._id,
        }))
      );
    } catch (err) {
      console.error(
        "Failed to activate session:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to activate academic session."
      );
    } finally {
      setActionId(null);
    }
  }

  async function handleComplete(session) {
    const confirmed =
      window.confirm(
        `Mark ${session.name} as completed? This should only be done after the academic year has ended.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionId(session._id);
      setError("");

      const response =
        await completeAcademicSession(
          session._id
        );

      setSessions((current) =>
        current.map((item) =>
          item._id ===
          response.data._id
            ? response.data
            : item
        )
      );
    } catch (err) {
      console.error(
        "Failed to complete session:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to complete academic session."
      );
    } finally {
      setActionId(null);
    }
  }

  async function handleDelete(session) {
    const confirmed =
      window.confirm(
        `Delete academic session ${session.name}? This action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionId(session._id);
      setError("");

      await deleteAcademicSession(
        session._id
      );

      setSessions((current) =>
        current.filter(
          (item) =>
            item._id !== session._id
        )
      );
    } catch (err) {
      console.error(
        "Failed to delete session:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to delete academic session."
      );
    } finally {
      setActionId(null);
    }
  }

  if (!canView) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        You do not have permission to view
        academic sessions.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Academic Sessions
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage academic years, terms and
            the current academic period.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={openCreateModal}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            + New Academic Session
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

      {/* Current session */}
      <CurrentSessionCard
        session={sessions.find(
          (session) =>
            session.isActive
        )}
      />

      {/* Sessions */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold text-slate-900">
            Academic Years
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {sessions.length} session
            {sessions.length === 1
              ? ""
              : "s"}
          </p>
        </div>

        {loading ? (
          <LoadingState />
        ) : sessions.length === 0 ? (
          <EmptyState
            canManage={canManage}
            onCreate={openCreateModal}
          />
        ) : (
          <div className="divide-y divide-slate-200">
            {sessions.map((session) => (
              <SessionCard
                key={session._id}
                session={session}
                canManage={canManage}
                actionId={actionId}
                onEdit={openEditModal}
                onActivate={
                  handleActivate
                }
                onComplete={
                  handleComplete
                }
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>

      <AcademicSessionFormModal
        open={modalOpen}
        session={editingSession}
        saving={saving}
        onClose={closeModal}
        onSubmit={handleSave}
      />
    </div>
  );
}

function CurrentSessionCard({ session }) {
  if (!session) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <p className="text-sm font-semibold text-amber-800">
          No active academic session
        </p>

        <p className="mt-1 text-sm text-amber-700">
          Activate an academic session before
          starting academic operations.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />

            <span className="text-xs font-semibold uppercase tracking-wide text-green-700">
              Active Academic Session
            </span>
          </div>

          <h2 className="mt-2 text-xl font-bold text-green-900">
            {session.name}
          </h2>

          <p className="mt-1 text-sm text-green-700">
            {formatDate(
              session.startDate
            )}{" "}
            —{" "}
            {formatDate(
              session.endDate
            )}
          </p>
        </div>

        <div className="rounded-lg bg-white/70 px-4 py-3">
          <p className="text-xs text-slate-500">
            Terms
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-800">
            {session.terms?.length || 0}{" "}
            terms
          </p>
        </div>
      </div>
    </div>
  );
}

function SessionCard({
  session,
  canManage,
  actionId,
  onEdit,
  onActivate,
  onComplete,
  onDelete,
}) {
  const busy =
    actionId === session._id;

  return (
    <div className="p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        {/* Information */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900">
              {session.name}
            </h3>

            {session.isActive && (
              <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                Active
              </span>
            )}

            {session.isCompleted && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                Completed
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-slate-500">
            {formatDate(
              session.startDate
            )}{" "}
            —{" "}
            {formatDate(
              session.endDate
            )}
          </p>

          {/* Terms */}
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {session.terms?.map((term) => (
              <div
                key={term.name}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">
                    {term.name}
                  </p>

                  {term.isActive && (
                    <span className="text-xs font-medium text-green-600">
                      Active
                    </span>
                  )}
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  {formatDate(
                    term.startDate
                  )}
                </p>

                <p className="text-xs text-slate-500">
                  to{" "}
                  {formatDate(
                    term.endDate
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        {canManage && (
          <div className="flex flex-wrap gap-2 xl:w-48 xl:justify-end">
            <button
              type="button"
              onClick={() =>
                onEdit(session)
              }
              disabled={busy}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Edit
            </button>

            {!session.isActive &&
              !session.isCompleted && (
                <button
                  type="button"
                  onClick={() =>
                    onActivate(session)
                  }
                  disabled={busy}
                  className="rounded-lg border border-green-200 px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-50 disabled:opacity-50"
                >
                  {busy
                    ? "Processing..."
                    : "Activate"}
                </button>
              )}

            {session.isActive &&
              !session.isCompleted && (
                <button
                  type="button"
                  onClick={() =>
                    onComplete(session)
                  }
                  disabled={busy}
                  className="rounded-lg border border-amber-200 px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                >
                  {busy
                    ? "Processing..."
                    : "Complete"}
                </button>
              )}

            {!session.isActive &&
              !session.isCompleted && (
                <button
                  type="button"
                  onClick={() =>
                    onDelete(session)
                  }
                  disabled={busy}
                  className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Delete
                </button>
              )}
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-5 p-6">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="animate-pulse space-y-4"
        >
          <div className="h-5 w-40 rounded bg-slate-200" />
          <div className="h-3 w-64 rounded bg-slate-200" />

          <div className="grid gap-3 md:grid-cols-3">
            <div className="h-24 rounded bg-slate-100" />
            <div className="h-24 rounded bg-slate-100" />
            <div className="h-24 rounded bg-slate-100" />
          </div>
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
        📅
      </div>

      <h3 className="mt-4 font-semibold text-slate-900">
        No academic sessions
      </h3>

      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
        Create your first academic session to
        start managing the school's academic
        calendar.
      </p>

      {canManage && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Create Academic Session
        </button>
      )}
    </div>
  );
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
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