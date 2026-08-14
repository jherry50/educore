import { useEffect, useState } from "react";

const initialForm = {
  name: "",
  code: "",
  description: "",
  section: "Secondary",
  isCore: false,
  isActive: true,
};

export default function SubjectFormModal({
  open,
  subject,
  saving,
  onClose,
  onSubmit,
}) {
  const [form, setForm] =
    useState(initialForm);

  const [error, setError] = useState("");

  const isEditing = Boolean(subject);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (subject) {
      setForm({
        name: subject.name || "",
        code: subject.code || "",
        description:
          subject.description || "",
        section:
          subject.section || "Secondary",
        isCore: Boolean(subject.isCore),
        isActive:
          subject.isActive !== false,
      });
    } else {
      setForm(initialForm);
    }

    setError("");
  }, [open, subject]);

  function handleChange(event) {
    const { name, value, type, checked } =
      event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Subject name is required.");
      return;
    }

    if (!form.code.trim()) {
      setError("Subject code is required.");
      return;
    }

    if (!form.section) {
      setError("Section is required.");
      return;
    }

    setError("");

    onSubmit({
      ...form,
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      description:
        form.description.trim() || undefined,
    });
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div
        className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="subject-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2
              id="subject-modal-title"
              className="text-lg font-semibold text-slate-900"
            >
              {isEditing
                ? "Edit Subject"
                : "Create Subject"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isEditing
                ? "Update subject information."
                : "Add a new subject to the school."}
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

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 p-6">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label
                htmlFor="subject-name"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Subject Name
              </label>

              <input
                id="subject-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Mathematics"
                maxLength={100}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Code */}
            <div>
              <label
                htmlFor="subject-code"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Subject Code
              </label>

              <input
                id="subject-code"
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="e.g. MATH"
                maxLength={20}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm uppercase outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Section */}
            <div>
              <label
                htmlFor="subject-section"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Section
              </label>

              <select
                id="subject-section"
                name="section"
                value={form.section}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="Primary">
                  Primary
                </option>

                <option value="Secondary">
                  Secondary
                </option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="subject-description"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Description
              </label>

              <textarea
                id="subject-description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                maxLength={500}
                placeholder="Optional subject description..."
                className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Options */}
            <div className="space-y-3">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  name="isCore"
                  checked={form.isCore}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300"
                />

                <span>
                  <span className="block text-sm font-medium text-slate-700">
                    Core subject
                  </span>

                  <span className="block text-xs text-slate-500">
                    Mark this subject as a core
                    curriculum subject.
                  </span>
                </span>
              </label>

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
                    Active
                  </span>

                  <span className="block text-xs text-slate-500">
                    Inactive subjects cannot be
                    used for new assignments.
                  </span>
                </span>
              </label>
            </div>
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
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : isEditing
                ? "Save Changes"
                : "Create Subject"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}