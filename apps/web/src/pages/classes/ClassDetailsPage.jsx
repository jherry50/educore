import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getClass, assignClassTeacher } from "../../api/classApi";
import { getTeachers } from "../../api/teacherApi";
import { useAuth } from "../../hooks/useAuth";

import AssignTeacherModal from "../../components/classes/AssignTeacherModal";

export default function ClassDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { hasPermission } = useAuth();

  const [schoolClass, setSchoolClass] = useState(null);
  const [teachers, setTeachers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingTeachers, setLoadingTeachers] =
    useState(false);

  const [teacherModalOpen, setTeacherModalOpen] =
    useState(false);

  const [savingTeacher, setSavingTeacher] =
    useState(false);

  const [error, setError] = useState("");

  const canUpdateClass =
    hasPermission("classes.update");

  useEffect(() => {
    loadClass();
  }, [id]);

  async function loadClass() {
    try {
      setLoading(true);
      setError("");

      const response = await getClass(id);

      setSchoolClass(response.data);
    } catch (err) {
      console.error(
        "Failed to load class:",
        err
      );

      const status = err.response?.status;

      if (status === 404) {
        setError("Class not found.");
      } else if (status === 403) {
        setError(
          "You do not have permission to view this class."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to load class."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadTeachers() {
    try {
      setLoadingTeachers(true);

      const response = await getTeachers({
        isActive: true,
      });

      const teacherList =
        response.data || [];

      const activeTeachers =
        teacherList.filter(
          (teacher) =>
            teacher.isActive !== false &&
            teacher.employmentStatus ===
              "active"
        );

      setTeachers(activeTeachers);
    } catch (err) {
      console.error(
        "Failed to load teachers:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load teachers."
      );
    } finally {
      setLoadingTeachers(false);
    }
  }

  async function handleOpenTeacherModal() {
    setError("");

    await loadTeachers();

    setTeacherModalOpen(true);
  }

  async function handleAssignTeacher(
    teacherId
  ) {
    try {
      setSavingTeacher(true);
      setError("");

      const response =
        await assignClassTeacher(
          id,
          teacherId
        );

      setSchoolClass(response.data);

      setTeacherModalOpen(false);
    } catch (err) {
      console.error(
        "Failed to assign class teacher:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to update class teacher."
      );
    } finally {
      setSavingTeacher(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />

        <div className="h-32 animate-pulse rounded-xl bg-slate-200" />

        <div className="h-64 animate-pulse rounded-xl bg-slate-200" />
      </div>
    );
  }

  if (error && !schoolClass) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back
        </button>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h2 className="font-semibold text-red-800">
            Unable to load class
          </h2>

          <p className="mt-2 text-sm text-red-700">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!schoolClass) {
    return null;
  }

  const classTeacher =
    schoolClass.classTeacher;

  const teacherUser =
    classTeacher?.user;

  const teacherName = teacherUser
    ? `${teacherUser.firstName || ""} ${
        teacherUser.lastName || ""
      }`.trim()
    : "";

  return (
    <div className="space-y-6">
      {/* Breadcrumb / Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <Link
              to="/admin/classes"
              className="hover:text-blue-600"
            >
              Classes
            </Link>

            <span>/</span>

            <span className="text-slate-700">
              {schoolClass.name}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900">
            {schoolClass.name}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View class information and manage
            the assigned class teacher.
          </p>
        </div>

        <Link
          to="/admin/classes"
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          ← Back to Classes
        </Link>
      </div>

      {/* Error notification */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Class Overview */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Class Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Basic information about this class.
              </p>
            </div>

            <span
              className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium ${
                schoolClass.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {schoolClass.isActive
                ? "Active"
                : "Inactive"}
            </span>
          </div>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem
            label="Class Name"
            value={schoolClass.name}
          />

          <InfoItem
            label="Class Code"
            value={schoolClass.code}
          />

          <InfoItem
            label="Section"
            value={schoolClass.section}
          />

          <InfoItem
            label="Level"
            value={schoolClass.level}
          />

          <InfoItem
            label="Capacity"
            value={
              schoolClass.capacity
                ? `${schoolClass.capacity} students`
                : "Not specified"
            }
          />

          <InfoItem
            label="Created"
            value={formatDate(
              schoolClass.createdAt
            )}
          />

          <InfoItem
            label="Last Updated"
            value={formatDate(
              schoolClass.updatedAt
            )}
          />
        </div>

        {schoolClass.description && (
          <div className="border-t border-slate-200 px-6 py-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Description
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-700">
              {schoolClass.description}
            </p>
          </div>
        )}
      </section>

      {/* Class Teacher */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Class Teacher
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Teacher responsible for this class.
            </p>
          </div>

          {canUpdateClass && (
            <button
              type="button"
              onClick={handleOpenTeacherModal}
              disabled={loadingTeachers}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingTeachers
                ? "Loading..."
                : classTeacher
                ? "Change Teacher"
                : "Assign Teacher"}
            </button>
          )}
        </div>

        <div className="p-6">
          {classTeacher ? (
            <div className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                  {getInitials(
                    teacherUser?.firstName,
                    teacherUser?.lastName
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900">
                    {teacherName ||
                      "Unnamed Teacher"}
                  </h3>

                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500">
                    {classTeacher.staffId && (
                      <span>
                        {classTeacher.staffId}
                      </span>
                    )}

                    {classTeacher.department && (
                      <span>
                        {classTeacher.department}
                      </span>
                    )}
                  </div>

                  {teacherUser?.email && (
                    <p className="mt-1 text-xs text-slate-400">
                      {teacherUser.email}
                    </p>
                  )}
                </div>
              </div>

              {canUpdateClass && (
                <button
                  type="button"
                  onClick={() =>
                    handleAssignTeacher(null)
                  }
                  disabled={savingTeacher}
                  className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingTeacher
                    ? "Removing..."
                    : "Remove"}
                </button>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 px-6 py-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
                👤
              </div>

              <h3 className="mt-4 font-medium text-slate-800">
                No Class Teacher Assigned
              </h3>

              <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                This class does not currently
                have a class teacher.
              </p>

              {canUpdateClass && (
                <button
                  type="button"
                  onClick={handleOpenTeacherModal}
                  className="mt-4 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Assign Teacher
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Future modules */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          title="Students"
          description="Students assigned to this class will appear here."
        />

        <FeatureCard
          title="Subjects"
          description="Class subjects and subject teachers will appear here."
        />

        <FeatureCard
          title="Attendance"
          description="Attendance information for this class will appear here."
        />
      </section>

      {/* Assign Teacher Modal */}
      <AssignTeacherModal
        open={teacherModalOpen}
        teachers={teachers}
        currentTeacherId={
          classTeacher?._id || ""
        }
        saving={savingTeacher}
        onClose={() =>
          setTeacherModalOpen(false)
        }
        onAssign={handleAssignTeacher}
      />
    </div>
  );
}

/* -----------------------------------------
   Reusable Components
------------------------------------------ */

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-900">
        {value || "Not specified"}
      </p>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* -----------------------------------------
   Helpers
------------------------------------------ */

function getInitials(firstName, lastName) {
  const first =
    firstName?.trim()?.[0] || "";

  const last =
    lastName?.trim()?.[0] || "";

  return `${first}${last}`.toUpperCase() || "T";
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}