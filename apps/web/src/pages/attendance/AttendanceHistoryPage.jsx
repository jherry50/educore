import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../hooks/useAuth";

import {
  getAcademicSessions,
} from "../../api/academicSessionApi";

import {
  getClasses,
} from "../../api/classApi";

import {
  getMyTeacherAssignments,
} from "../../api/teacherAssignmentApi";

import {
  getAttendance,
  updateAttendance,
} from "../../api/attendanceApi";

const STATUS_OPTIONS = [
  "All",
  "Present",
  "Absent",
  "Late",
  "Excused",
];

export default function AttendanceHistoryPage() {
  const { user } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [records, setRecords] = useState([]);

  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm, setEditForm] = useState({
    status: "",
    remarks: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const [filters, setFilters] = useState({
    academicSession: "",
    term: "",
    class: "",
    startDate: "",
    endDate: "",
    status: "All",
    search: "",
  });

  const [loading, setLoading] = useState(true);
  const [loadingRecords, setLoadingRecords] =
    useState(false);

  const [error, setError] = useState("");

  const isTeacher =
    user?.role?.name?.toLowerCase() === "teacher";

  /*
   * Load academic sessions.
   */
  useEffect(() => {
    if (!user) return;

    loadInitialData();
  }, [user]);

  async function loadInitialData() {
    try {
      setLoading(true);
      setError("");

      const sessionResponse =
        await getAcademicSessions({
          limit: 100,
        });

      setSessions(
        extractList(sessionResponse)
      );

      if (isTeacher) {
        /*
         * Teachers only see their
         * assigned classes.
         */
        const assignmentResponse =
          await getMyTeacherAssignments();

        const assignments =
          extractList(
            assignmentResponse
          );

        setClasses(
          extractUniqueClasses(
            assignments
          )
        );
      } else {
        const classResponse =
          await getClasses({
            limit: 100,
          });

        setClasses(
          extractList(classResponse)
        );
      }
    } catch (err) {
      console.error(
        "Failed to load attendance history options:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load attendance options."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * Teacher classes must be refreshed
   * when session/term changes.
   */
  useEffect(() => {
    if (
      !isTeacher ||
      !filters.academicSession ||
      !filters.term
    ) {
      return;
    }

    loadTeacherClasses();
  }, [
    isTeacher,
    filters.academicSession,
    filters.term,
  ]);

  async function loadTeacherClasses() {
    try {
      const response =
        await getMyTeacherAssignments({
          academicSession:
            filters.academicSession,
          term: filters.term,
        });

      const assignments =
        extractList(response);

      const teacherClasses =
        extractUniqueClasses(
          assignments
        );

      setClasses(teacherClasses);

      setFilters((current) => {
        const valid = teacherClasses.some(
          (item) =>
            item._id === current.class
        );

        return valid
          ? current
          : {
              ...current,
              class: "",
            };
      });
    } catch (err) {
      console.error(
        "Failed to load teacher classes:",
        err
      );

      setClasses([]);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load your assigned classes."
      );
    }
  }

  function openEditModal(record) {
    setEditingRecord(record);

    setEditForm({
      status: record.status || "Present",
      remarks: record.remarks || "",
    });
  }

  function closeEditModal() {
    if (savingEdit) {
      return;
    }

    setEditingRecord(null);

    setEditForm({
      status: "",
      remarks: "",
    });
  }

  function handleEditChange(event) {
    const {
      name,
      value,
    } = event.target;

    setEditForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSaveEdit() {
    if (!editingRecord?._id) {
      return;
    }

    try {
      setSavingEdit(true);
      setError("");

      await updateAttendance(
        editingRecord._id,
        {
          status: editForm.status,
          remarks: editForm.remarks,
        }
      );

      /*
      * Refresh the current result set
      * so the table immediately reflects
      * the change.
      */
      await handleSearch();

      closeEditModal();
    } catch (err) {
      console.error(
        "Failed to update attendance:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to update attendance."
      );
    } finally {
      setSavingEdit(false);
    }
  }

  /*
   * Available terms from selected session.
   */
  const selectedSession = useMemo(
    () =>
      sessions.find(
        (session) =>
          session._id ===
          filters.academicSession
      ),
    [
      sessions,
      filters.academicSession,
    ]
  );

  const terms =
    selectedSession?.terms || [];

  function handleFilterChange(
    event
  ) {
    const {
      name,
      value,
    } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSearch() {
    try {
      setLoadingRecords(true);
      setError("");

      const params = {};

      if (filters.academicSession) {
        params.academicSession =
          filters.academicSession;
      }

      if (filters.term) {
        params.term =
          filters.term;
      }

      if (filters.class) {
        params.class =
          filters.class;
      }

      if (filters.startDate) {
        params.startDate =
          filters.startDate;
      }

      if (filters.endDate) {
        params.endDate =
          filters.endDate;
      }

      if (
        filters.status &&
        filters.status !== "All"
      ) {
        params.status =
          filters.status;
      }

      const response =
        await getAttendance(params);

      setRecords(
        extractList(response)
      );
    } catch (err) {
      console.error(
        "Failed to load attendance history:",
        err
      );

      setRecords([]);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load attendance history."
      );
    } finally {
      setLoadingRecords(false);
    }
  }

  function handleReset() {
    setFilters({
      academicSession: "",
      term: "",
      class: "",
      startDate: "",
      endDate: "",
      status: "All",
      search: "",
    });

    setRecords([]);
    setError("");
  }

  /*
   * Client-side student search.
   */
  const filteredRecords = useMemo(() => {
    const search =
      filters.search
        .trim()
        .toLowerCase();

    if (!search) {
      return records;
    }

    return records.filter(
      (record) => {
        const student =
          record.student || {};

        const name = [
          student.firstName,
          student.middleName,
          student.lastName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const admissionNumber =
          String(
            student.admissionNumber ||
              ""
          ).toLowerCase();

        return (
          name.includes(search) ||
          admissionNumber.includes(
            search
          )
        );
      }
    );
  }, [
    records,
    filters.search,
  ]);

  const summary = useMemo(() => {
    const result = {
      total: filteredRecords.length,
      Present: 0,
      Absent: 0,
      Late: 0,
      Excused: 0,
    };

    filteredRecords.forEach(
      (record) => {
        if (
          result[record.status] !==
          undefined
        ) {
          result[record.status]++;
        }
      }
    );

    return result;
  }, [filteredRecords]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Attendance History
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View previously recorded student
          attendance.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {/* Session */}
          <FilterField label="Academic Session">
            <select
              name="academicSession"
              value={
                filters.academicSession
              }
              onChange={
                handleFilterChange
              }
              className="filter-input"
              disabled={loading}
            >
              <option value="">
                All sessions
              </option>

              {sessions.map(
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
          </FilterField>

          {/* Term */}
          <FilterField label="Term">
            <select
              name="term"
              value={filters.term}
              onChange={
                handleFilterChange
              }
              className="filter-input"
              disabled={
                !filters.academicSession
              }
            >
              <option value="">
                All terms
              </option>

              {terms.map((term) => (
                <option
                  key={
                    term._id ||
                    term.name
                  }
                  value={term.name}
                >
                  {term.name}
                </option>
              ))}
            </select>
          </FilterField>

          {/* Class */}
          <FilterField label="Class">
            <select
              name="class"
              value={filters.class}
              onChange={
                handleFilterChange
              }
              className="filter-input"
              disabled={loading}
            >
              <option value="">
                All classes
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
          </FilterField>

          {/* Status */}
          <FilterField label="Status">
            <select
              name="status"
              value={filters.status}
              onChange={
                handleFilterChange
              }
              className="filter-input"
            >
              {STATUS_OPTIONS.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                )
              )}
            </select>
          </FilterField>

          {/* Start date */}
          <FilterField label="Start Date">
            <input
              type="date"
              name="startDate"
              value={
                filters.startDate
              }
              onChange={
                handleFilterChange
              }
              className="filter-input"
            />
          </FilterField>

          {/* End date */}
          <FilterField label="End Date">
            <input
              type="date"
              name="endDate"
              value={
                filters.endDate
              }
              onChange={
                handleFilterChange
              }
              className="filter-input"
            />
          </FilterField>

          {/* Student search */}
          <FilterField label="Student">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={
                handleFilterChange
              }
              placeholder="Name or admission no."
              className="filter-input"
            />
          </FilterField>

          {/* Buttons */}
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={
                handleSearch
              }
              disabled={
                loadingRecords
              }
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loadingRecords
                ? "Loading..."
                : "Search"}
            </button>

            <button
              type="button"
              onClick={
                handleReset
              }
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      {records.length > 0 && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <SummaryCard
            label="Total"
            value={summary.total}
          />

          <SummaryCard
            label="Present"
            value={summary.Present}
          />

          <SummaryCard
            label="Absent"
            value={summary.Absent}
          />

          <SummaryCard
            label="Late"
            value={summary.Late}
          />

          <SummaryCard
            label="Excused"
            value={summary.Excused}
          />
        </div>
      )}

      {/* Results */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loadingRecords ? (
          <div className="px-6 py-16 text-center text-sm text-slate-500">
            Loading attendance history...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h3 className="font-medium text-slate-900">
              No attendance records
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Apply filters and click
              Search to find attendance
              records.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Date
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Student
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Admission No.
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Class
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Remarks
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map(
                    (record) => (
                      <HistoryRow
                        key={
                          record._id
                        }
                        record={
                          record
                        }
                        onEdit={openEditModal}
                      />
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="space-y-3 p-4 md:hidden">
              {filteredRecords.map(
                (record) => (
                  <HistoryCard
                    key={
                      record._id
                    }
                    record={
                      record
                    }
                    onEdit={openEditModal}
                  />
                )
              )}
            </div>
          </>
        )}
      </div>

{     /* Edit modal       */}
      {editingRecord && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Edit Attendance
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {getStudentName(
                editingRecord.student || {}
              )}
            </p>
          </div>

          <div className="space-y-5 p-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Status
              </label>

              <select
                name="status"
                value={editForm.status}
                onChange={handleEditChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="Present">
                  Present
                </option>

                <option value="Absent">
                  Absent
                </option>

                <option value="Late">
                  Late
                </option>

                <option value="Excused">
                  Excused
                </option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Remarks
              </label>

              <textarea
                name="remarks"
                value={editForm.remarks}
                onChange={handleEditChange}
                rows={4}
                placeholder="Optional remarks..."
                className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
            <button
              type="button"
              onClick={closeEditModal}
              disabled={savingEdit}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={savingEdit}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {savingEdit
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}

function FilterField({
  label,
  children,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>

      {children}
    </div>
  );
}

function SummaryCard({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function HistoryRow({
  record,
  onEdit,
}) {
  const student =
    record.student || {};

  return (
    <tr>
      <td className="px-6 py-4 text-sm text-slate-600">
        {formatDate(record.date)}
      </td>

      <td className="px-6 py-4">
        <p className="font-medium text-slate-900">
          {getStudentName(student)}
        </p>
      </td>

      <td className="px-6 py-4 text-sm text-slate-600">
        {student.admissionNumber ||
          "—"}
      </td>

      <td className="px-6 py-4 text-sm text-slate-600">
        {record.class?.name || "—"}
      </td>

      <td className="px-6 py-4">
        <StatusBadge
          status={record.status}
        />
      </td>

      <td className="px-6 py-4 text-sm text-slate-500">
        {record.remarks || "—"}
      </td>
       <td className="px-6 py-4 text-right">
        <button
          type="button"
          onClick={() => onEdit(record)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Edit
        </button>
      </td>
    </tr>
  );
}

function HistoryCard({
  record,
  onEdit,
}) {
  const student =
    record.student || {};

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-slate-900">
            {getStudentName(student)}
          </p>

          <p className="text-xs text-slate-500">
            {student.admissionNumber ||
              "No admission number"}
          </p>
        </div>

        <StatusBadge
          status={record.status}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-slate-400">
            Date
          </p>

          <p className="text-slate-700">
            {formatDate(
              record.date
            )}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-400">
            Class
          </p>

          <p className="text-slate-700">
            {record.class?.name ||
              "—"}
          </p>
        </div>
      </div>

      {record.remarks && (
        <div className="mt-3">
          <p className="text-xs text-slate-400">
            Remarks
          </p>

          <p className="text-sm text-slate-600">
            {record.remarks}
          </p>
        </div>
      )}
      <div className="mt-4 border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={() => onEdit(record)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Edit Attendance
        </button>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}) {
  const classes = {
    Present:
      "bg-green-50 text-green-700 border-green-200",
    Absent:
      "bg-red-50 text-red-700 border-red-200",
    Late:
      "bg-yellow-50 text-yellow-700 border-yellow-200",
    Excused:
      "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
        classes[status] ||
        "bg-slate-50 text-slate-600 border-slate-200"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
}

function getStudentName(
  student
) {
  return [
    student.firstName,
    student.middleName,
    student.lastName,
  ]
    .filter(Boolean)
    .join(" ");
}

function formatDate(
  value
) {
  if (!value) return "—";

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
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

function extractList(
  response
) {
  if (Array.isArray(response)) {
    return response;
  }

  if (
    Array.isArray(
      response?.data
    )
  ) {
    return response.data;
  }

  if (
    Array.isArray(
      response?.data?.data
    )
  ) {
    return response.data.data;
  }

  return [];
}

function extractUniqueClasses(
  assignments
) {
  return Array.from(
    new Map(
      assignments
        .map(
          (assignment) =>
            assignment.class
        )
        .filter(Boolean)
        .filter(
          (classItem) =>
            classItem.isActive !==
            false
        )
        .map((classItem) => [
          classItem._id.toString(),
          classItem,
        ])
    ).values()
  );
}