import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getTeacher,
  updateTeacher,
} from "../../api/teacherApi";

export default function TeacherEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    staffId: "",
    qualification: "",
    department: "",
    specialization: "",
    employmentDate: "",
    employmentStatus: "active",
    address: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTeacher() {
      try {
        setLoading(true);

        const response =
          await getTeacher(id);

        const teacher = response.data;
        const user = teacher.user;

        setForm({
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          email: user?.email || "",
          phone: user?.phone || "",
          staffId: teacher.staffId || "",
          qualification:
            teacher.qualification || "",
          department:
            teacher.department || "",
          specialization:
            teacher.specialization || "",
          employmentDate: teacher.employmentDate
            ? teacher.employmentDate.substring(
                0,
                10
              )
            : "",
          employmentStatus:
            teacher.employmentStatus ||
            "active",
          address: teacher.address || "",
          isActive:
            teacher.isActive ?? true,
        });
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load teacher."
        );
      } finally {
        setLoading(false);
      }
    }

    loadTeacher();
  }, [id]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      await updateTeacher(id, form);

      navigate(`/admin/teachers/${id}`);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to update teacher."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading teacher...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link
          to={`/admin/teachers/${id}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Teacher
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          Edit Teacher
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Update teacher and employment information.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Personal */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="font-semibold text-slate-900">
              Personal Information
            </h2>
          </div>

          <div className="grid gap-5 p-6 md:grid-cols-2">
            <Field
              label="First Name"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
            />

            <Field
              label="Last Name"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
            />

            <Field
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <Field
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />

            <div className="md:col-span-2">
              <Field
                label="Address"
                name="address"
                value={form.address}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        {/* Employment */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="font-semibold text-slate-900">
              Employment Information
            </h2>
          </div>

          <div className="grid gap-5 p-6 md:grid-cols-2">
            <Field
              label="Staff ID"
              name="staffId"
              value={form.staffId}
              onChange={handleChange}
              required
            />

            <Field
              label="Qualification"
              name="qualification"
              value={form.qualification}
              onChange={handleChange}
            />

            <Field
              label="Department"
              name="department"
              value={form.department}
              onChange={handleChange}
            />

            <Field
              label="Specialization"
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
            />

            <Field
              label="Employment Date"
              name="employmentDate"
              type="date"
              value={form.employmentDate}
              onChange={handleChange}
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Employment Status
              </label>

              <select
                name="employmentStatus"
                value={form.employmentStatus}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="active">
                  Active
                </option>
                <option value="inactive">
                  Inactive
                </option>
                <option value="on_leave">
                  On Leave
                </option>
                <option value="resigned">
                  Resigned
                </option>
                <option value="terminated">
                  Terminated
                </option>
              </select>
            </div>
          </div>
        </section>

        {/* Account */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="font-semibold text-slate-900">
              Account
            </h2>
          </div>

          <div className="p-6">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    isActive:
                      event.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-slate-300"
              />

              <span className="text-sm font-medium text-slate-700">
                Teacher account is active
              </span>
            </label>
          </div>
        </section>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link
            to={`/admin/teachers/${id}`}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-medium text-slate-700"
      >
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}