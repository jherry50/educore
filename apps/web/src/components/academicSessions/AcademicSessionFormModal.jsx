import { useEffect, useState } from "react";

const defaultTerms = [
  {
    name: "First Term",
    startDate: "",
    endDate: "",
    isActive: false,
  },
  {
    name: "Second Term",
    startDate: "",
    endDate: "",
    isActive: false,
  },
  {
    name: "Third Term",
    startDate: "",
    endDate: "",
    isActive: false,
  },
];

const initialForm = {
  name: "",
  startDate: "",
  endDate: "",
  terms: defaultTerms,
};

export default function AcademicSessionFormModal({
  open,
  session,
  saving,
  onClose,
  onSubmit,
}) {
  const [form, setForm] =
    useState(initialForm);

  const [error, setError] =
    useState("");

  const isEditing =
    Boolean(session);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (session) {
      setForm({
        name: session.name || "",
        startDate: formatDateForInput(
          session.startDate
        ),
        endDate: formatDateForInput(
          session.endDate
        ),
        terms:
          session.terms?.length > 0
            ? [
                "First Term",
                "Second Term",
                "Third Term",
              ].map((termName) => {
                const existingTerm =
                  session.terms.find(
                    (term) =>
                      term.name ===
                      termName
                  );

                return {
                  name: termName,
                  startDate:
                    existingTerm
                      ? formatDateForInput(
                          existingTerm.startDate
                        )
                      : "",
                  endDate:
                    existingTerm
                      ? formatDateForInput(
                          existingTerm.endDate
                        )
                      : "",
                  isActive:
                    existingTerm
                      ?.isActive || false,
                };
              })
            : defaultTerms,
      });
    } else {
      setForm(initialForm);
    }

    setError("");
  }, [open, session]);

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleTermChange(
    index,
    field,
    value
  ) {
    setForm((current) => ({
      ...current,
      terms: current.terms.map(
        (term, termIndex) =>
          termIndex === index
            ? {
                ...term,
                [field]: value,
              }
            : term
      ),
    }));
  }

  function validate() {
    if (!form.name.trim()) {
      return "Academic session name is required.";
    }

    if (!form.startDate) {
      return "Session start date is required.";
    }

    if (!form.endDate) {
      return "Session end date is required.";
    }

    if (
      new Date(form.startDate) >=
      new Date(form.endDate)
    ) {
      return "Session end date must be after the start date.";
    }

    for (const term of form.terms) {
      if (!term.startDate) {
        return `${term.name} start date is required.`;
      }

      if (!term.endDate) {
        return `${term.name} end date is required.`;
      }

      if (
        new Date(term.startDate) >=
        new Date(term.endDate)
      ) {
        return `${term.name} end date must be after its start date.`;
      }

      if (
        new Date(term.startDate) <
          new Date(form.startDate) ||
        new Date(term.endDate) >
          new Date(form.endDate)
      ) {
        return `${term.name} must fall within the academic session dates.`;
      }
    }

    return "";
  }

  function handleSubmit(event) {
    event.preventDefault();

    const validationError =
      validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");

    onSubmit({
      name: form.name.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      terms: form.terms,
    });
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isEditing
                ? "Edit Academic Session"
                : "Create Academic Session"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Configure the academic year and
              its three terms.
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
          <div className="space-y-6 p-6">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Session Information */}
            <section>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Session Information
              </h3>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-1">
                  <label
                    htmlFor="session-name"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Session Name
                  </label>

                  <input
                    id="session-name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="2026/2027"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="session-start"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Start Date
                  </label>

                  <input
                    id="session-start"
                    name="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="session-end"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    End Date
                  </label>

                  <input
                    id="session-end"
                    name="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </section>

            {/* Terms */}
            <section>
              <div className="mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Academic Terms
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Each term must fall within the
                  academic session dates.
                </p>
              </div>

              <div className="space-y-4">
                {form.terms.map(
                  (term, index) => (
                    <div
                      key={term.name}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="font-medium text-slate-800">
                          {term.name}
                        </h4>

                        {term.isActive && (
                          <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label
                            htmlFor={`term-start-${index}`}
                            className="mb-1.5 block text-xs font-medium text-slate-600"
                          >
                            Start Date
                          </label>

                          <input
                            id={`term-start-${index}`}
                            type="date"
                            value={
                              term.startDate
                            }
                            onChange={(event) =>
                              handleTermChange(
                                index,
                                "startDate",
                                event.target
                                  .value
                              )
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`term-end-${index}`}
                            className="mb-1.5 block text-xs font-medium text-slate-600"
                          >
                            End Date
                          </label>

                          <input
                            id={`term-end-${index}`}
                            type="date"
                            value={
                              term.endDate
                            }
                            onChange={(event) =>
                              handleTermChange(
                                index,
                                "endDate",
                                event.target
                                  .value
                              )
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
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
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : isEditing
                ? "Save Changes"
                : "Create Session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatDateForInput(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().split("T")[0];
}