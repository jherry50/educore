import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getTeacher } from "../../api/teacherApi";
import { useAuth } from "../../hooks/useAuth";

export default function TeacherDetailsPage() {
  const { id } = useParams();
  const { hasPermission } = useAuth();

  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTeacher() {
    try {
      setLoading(true);
      setError("");

      const response = await getTeacher(id);

      setTeacher(response.data);
    } catch (error) {
      console.error(
        "Failed to load teacher:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load teacher."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeacher();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading teacher...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link
          to="/admin/teachers"
          className="text-sm font-medium text-blue-600"
        >
          ← Back to Teachers
        </Link>

        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!teacher) {
    return null;
  }

  const user = teacher.user;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/admin/teachers"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back to Teachers
          </Link>

          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            {user?.firstName} {user?.lastName}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Teacher profile and employment information.
          </p>
        </div>

        {hasPermission("teachers.update") && (
          <Link
            to={`/admin/teachers/${teacher._id}/edit`}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Edit Teacher
          </Link>
        )}
      </div>

      {/* Personal Information */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold text-slate-900">
            Personal Information
          </h2>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <InfoItem
            label="First Name"
            value={user?.firstName}
          />

          <InfoItem
            label="Last Name"
            value={user?.lastName}
          />

          <InfoItem
            label="Email"
            value={user?.email}
          />

          <InfoItem
            label="Phone"
            value={user?.phone}
          />

          <div className="md:col-span-2">
            <InfoItem
              label="Address"
              value={teacher.address}
            />
          </div>
        </div>
      </section>

      {/* Employment Information */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold text-slate-900">
            Employment Information
          </h2>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <InfoItem
            label="Staff ID"
            value={teacher.staffId}
          />

          <InfoItem
            label="Department"
            value={teacher.department}
          />

          <InfoItem
            label="Qualification"
            value={teacher.qualification}
          />

          <InfoItem
            label="Specialization"
            value={teacher.specialization}
          />

          <InfoItem
            label="Employment Date"
            value={
              teacher.employmentDate
                ? new Date(
                    teacher.employmentDate
                  ).toLocaleDateString()
                : "—"
            }
          />

          <InfoItem
            label="Employment Status"
            value={formatStatus(
              teacher.employmentStatus
            )}
          />
        </div>
      </section>

      {/* Account Information */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold text-slate-900">
            Account Information
          </h2>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <InfoItem
            label="Account Status"
            value={
              user?.isActive
                ? "Active"
                : "Inactive"
            }
          />

          <InfoItem
            label="Email Verified"
            value={
              user?.isEmailVerified
                ? "Yes"
                : "No"
            }
          />
        </div>
      </section>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-800">
        {value || "—"}
      </p>
    </div>
  );
}

function formatStatus(status) {
  if (!status) {
    return "—";
  }

  return status
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}