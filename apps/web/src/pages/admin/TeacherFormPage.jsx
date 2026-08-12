import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { createTeacher } from "../../api/teacherApi";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  staffId: "",
  qualification: "",
  department: "",
  specialization: "",
  employmentDate: "",
  employmentStatus: "active",
  address: "",
};

export default function TeacherFormPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      setLoading(true);
      setError("");

      await createTeacher(form);

      navigate("/admin/teachers");
    } catch (error) {
      console.error(
        "Failed to create teacher:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to create teacher."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/admin/teachers"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Teachers
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          Add Teacher
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Create a teacher profile and login account.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Personal Information */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="font-semibold text-slate-900">
              Personal Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Basic information about the teacher.
            </p>
          </div>

          <div className="grid gap-5 p-6 md:grid-cols-2">
            <FormField
              label="First Name"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
            />

            <FormField
              label="Last Name"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
            />

            <FormField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <FormField
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />

            <div className="md:col-span-2">
              <FormField
                label="Address"
                name="address"
                value={form.address}
                onChange={handleChange}
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

            <p className="mt-1 text-sm text-slate-500">
              School and employment details.
            </p>
          </div>

          <div className="grid gap-5 p-6 md:grid-cols-2">
            <FormField
              label="Staff ID"
              name="staffId"
              value={form.staffId}
              onChange={handleChange}
              placeholder="e.g. TCH-0002"
              required
            />

            <FormField
              label="Qualification"
              name="qualification"
              value={form.qualification}
              onChange={handleChange}
              placeholder="e.g. B.Ed Mathematics"
            />

            <FormField
              label="Department"
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder="e.g. Mathematics"
            />

            <FormField
              label="Specialization"
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
              placeholder="e.g. Mathematics"
            />

            <div>
              <label
                htmlFor="employmentDate"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Employment Date
              </label>

              <input
                id="employmentDate"
                name="employmentDate"
                type="date"
                value={form.employmentDate}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="employmentStatus"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Employment Status
              </label>

              <select
                id="employmentStatus"
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

        {/* Account Information */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="font-semibold text-slate-900">
              Login Account
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              The teacher will use these credentials to
              access the school system.
            </p>
          </div>

          <div className="p-6">
            <FormField
              label="Temporary Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <p className="mt-2 text-xs text-slate-500">
              The teacher should change this password
              after their first login.
            </p>
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            to="/admin/teachers"
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Creating..."
              : "Create Teacher"}
          </button>
        </div>
      </form>
    </div>
  );
}

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
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
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}