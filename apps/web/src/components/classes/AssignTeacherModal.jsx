import { useEffect, useMemo, useState } from "react";

export default function AssignTeacherModal({
  open,
  teachers,
  currentTeacherId,
  saving,
  onClose,
  onAssign,
}) {
  const [search, setSearch] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] =
    useState(currentTeacherId || "");

  useEffect(() => {
    if (open) {
      setSearch("");
      setSelectedTeacherId(
        currentTeacherId || ""
      );
    }
  }, [open, currentTeacherId]);

  const filteredTeachers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return teachers;
    }

    return teachers.filter((teacher) => {
      const user = teacher.user;

      const name =
        `${user?.firstName || ""} ${
          user?.lastName || ""
        }`.toLowerCase();

      const staffId =
        teacher.staffId?.toLowerCase() || "";

      const department =
        teacher.department?.toLowerCase() || "";

      return (
        name.includes(term) ||
        staffId.includes(term) ||
        department.includes(term)
      );
    });
  }, [teachers, search]);

  if (!open) {
    return null;
  }

  function handleSubmit(event) {
    event.preventDefault();

    onAssign(selectedTeacherId || null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div
        className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-teacher-title"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2
              id="assign-teacher-title"
              className="text-lg font-semibold text-slate-900"
            >
              Assign Class Teacher
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select an active teacher for this class.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search teachers..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <div className="mt-4 max-h-72 overflow-y-auto rounded-lg border border-slate-200">
              {filteredTeachers.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-slate-500">
                  No active teachers found.
                </div>
              ) : (
                filteredTeachers.map((teacher) => {
                  const user = teacher.user;

                  const name =
                    `${user?.firstName || ""} ${
                      user?.lastName || ""
                    }`.trim();

                  return (
                    <label
                      key={teacher._id}
                      className="flex cursor-pointer items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-slate-50"
                    >
                      <input
                        type="radio"
                        name="classTeacher"
                        value={teacher._id}
                        checked={
                          selectedTeacherId ===
                          teacher._id
                        }
                        onChange={() =>
                          setSelectedTeacherId(
                            teacher._id
                          )
                        }
                        className="h-4 w-4"
                      />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {name || "Unnamed Teacher"}
                        </p>

                        <p className="text-xs text-slate-500">
                          {teacher.staffId || "No Staff ID"}
                          {teacher.department
                            ? ` · ${teacher.department}`
                            : ""}
                        </p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Assign Teacher"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}