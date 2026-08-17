import { useEffect, useMemo, useState } from "react";

import { getAcademicSessions } from "../../api/academicSessionApi";

const initialForm = {
  teacher: "",
  subject: "",
  class: "",
  academicSession: "",
  term: "",
  isActive: true,
};

export default function TeacherAssignmentFormModal({
  open,
  assignment,
  teachers,
  subjects,
  classes,
  loadingOptions,
  saving,
  onClose,
  onSubmit,
}) {
  const [form, setForm] =
    useState(initialForm);

  const [academicSessions, setAcademicSessions] =
    useState([]);

  const [loadingSessions, setLoadingSessions] =
    useState(false);

  const [sessionError, setSessionError] =
    useState("");

  const [error, setError] =
    useState("");

  const isEditing =
    Boolean(assignment);

  /*
   * Load academic sessions whenever
   * the modal is opened.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    loadAcademicSessions();
  }, [open]);

  /*
   * Populate form when creating/editing.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    if (assignment) {
      const academicSessionId =
        assignment.academicSession?._id ||
        assignment.academicSession ||
        "";

      setForm({
        teacher:
          assignment.teacher?._id || "",
        subject:
          assignment.subject?._id || "",
        class:
          assignment.class?._id || "",
        academicSession:
          academicSessionId,
        term:
          assignment.term || "",
        isActive:
          assignment.isActive !== false,
      });
    } else {
      setForm(initialForm);
    }

    setError("");
    setSessionError("");
  }, [open, assignment]);

  async function loadAcademicSessions() {
    try {
      setLoadingSessions(true);
      setSessionError("");

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

      setSessionError(
        err?.response?.data?.message ||
          "Unable to load academic sessions."
      );
    } finally {
      setLoadingSessions(false);
    }
  }

  /*
   * Get terms belonging to the
   * currently selected session.
   */
  const availableTerms = useMemo(() => {
    if (!form.academicSession) {
      return [];
    }

    const selectedSession =
      academicSessions.find(
        (session) =>
          session._id ===
          form.academicSession
      );

    return selectedSession?.terms || [];
  }, [
    academicSessions,
    form.academicSession,
  ]);

  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  /*
   * Academic session changed.
   *
   * Clear the term because the previous
   * term may not exist in the new session.
   */
  function handleSessionChange(event) {
    const sessionId =
      event.target.value;

    setForm((current) => ({
      ...current,
      academicSession: sessionId,
      term: "",
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.teacher) {
      setError(
        "Please select a teacher."
      );
      return;
    }

    if (!form.subject) {
      setError(
        "Please select a subject."
      );
      return;
    }

    if (!form.class) {
      setError(
        "Please select a class."
      );
      return;
    }

    if (!form.academicSession) {
      setError(
        "Please select an academic session."
      );
      return;
    }

    if (!form.term) {
      setError(
        "Please select a term."
      );
      return;
    }

    /*
     * Make sure the selected term
     * actually belongs to the session.
     */
    const termExists =
      availableTerms.some(
        (term) =>
          term.name === form.term
      );

    if (!termExists) {
      setError(
        "The selected term is not available for this academic session."
      );
      return;
    }

    setError("");

    onSubmit(form);
  }

  if (!open) {
    return null;
  }

  const loading =
    loadingOptions ||
    loadingSessions;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div
        className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isEditing
                ? "Edit Teacher Assignment"
                : "Assign Teacher"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isEditing
                ? "Update this teaching assignment."
                : "Assign a teacher to a subject and class."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 p-6">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {sessionError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {sessionError}
              </div>
            )}

            {loading ? (
              <div className="rounded-lg bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                Loading teachers, subjects,
                classes and academic
                sessions...
              </div>
            ) : (
              <>
                {/* Academic Session */}
                <div>
                  <label
                    htmlFor="academicSession"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Academic Session
                  </label>

                  <select
                    id="academicSession"
                    name="academicSession"
                    value={
                      form.academicSession
                    }
                    onChange={
                      handleSessionChange
                    }
                    disabled={
                      loadingSessions ||
                      saving
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  >
                    <option value="">
                      Select academic session
                    </option>

                    {academicSessions.map(
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
                  <label
                    htmlFor="assignment-term"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Term
                  </label>

                  <select
                    id="assignment-term"
                    name="term"
                    value={form.term}
                    onChange={handleChange}
                    disabled={
                      !form.academicSession ||
                      availableTerms.length ===
                        0 ||
                      saving
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  >
                    <option value="">
                      {!form.academicSession
                        ? "Select academic session first"
                        : availableTerms.length ===
                          0
                        ? "No terms available"
                        : "Select term"}
                    </option>

                    {availableTerms.map(
                      (term) => (
                        <option
                          key={term._id || term.name}
                          value={term.name}
                        >
                          {term.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Teacher */}
                <div>
                  <label
                    htmlFor="assignment-teacher"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Teacher
                  </label>

                  <select
                    id="assignment-teacher"
                    name="teacher"
                    value={form.teacher}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">
                      Select teacher
                    </option>

                    {teachers.map(
                      (teacher) => (
                        <option
                          key={teacher._id}
                          value={teacher._id}
                        >
                          {getTeacherName(
                            teacher
                          )}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label
                    htmlFor="assignment-subject"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Subject
                  </label>

                  <select
                    id="assignment-subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">
                      Select subject
                    </option>

                    {subjects.map(
                      (subject) => (
                        <option
                          key={subject._id}
                          value={subject._id}
                        >
                          {subject.name} (
                          {subject.code})
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Class */}
                <div>
                  <label
                    htmlFor="assignment-class"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Class
                  </label>

                  <select
                    id="assignment-class"
                    name="class"
                    value={form.class}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">
                      Select class
                    </option>

                    {classes.map(
                      (classItem) => (
                        <option
                          key={classItem._id}
                          value={classItem._id}
                        >
                          {classItem.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Status */}
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300"
                  />

                  <span>
                    <span className="block text-sm font-medium text-slate-700">
                      Active assignment
                    </span>

                    <span className="block text-xs text-slate-500">
                      The teacher can use this
                      assignment for teaching,
                      attendance and results.
                    </span>
                  </span>
                </label>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                loading ||
                academicSessions.length === 0
              }
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : isEditing
                ? "Save Changes"
                : "Assign Teacher"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getTeacherName(teacher) {
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