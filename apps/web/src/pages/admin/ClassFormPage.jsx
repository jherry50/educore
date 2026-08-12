import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  createClass,
  getClass,
  updateClass,
} from "../../api/classApi";

const initialForm = {
  name: "",
  code: "",
  section: "",
  level: "",
  capacity: 30,
  description: "",
  isActive: true,
};

const levels = {
  Primary: [
    "Primary 1",
    "Primary 2",
    "Primary 3",
    "Primary 4",
    "Primary 5",
    "Primary 6",
  ],

  Secondary: [
    "JSS 1",
    "JSS 2",
    "JSS 3",
    "SS 1",
    "SS 2",
    "SS 3",
  ],
};

export default function ClassFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [form, setForm] =
    useState(initialForm);

  const [loading, setLoading] =
    useState(isEditMode);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    async function loadClass() {
      try {
        const response =
          await getClass(id);

        const schoolClass =
          response.data;

        setForm({
          name:
            schoolClass.name || "",
          code:
            schoolClass.code || "",
          section:
            schoolClass.section || "",
          level:
            schoolClass.level || "",
          capacity:
            schoolClass.capacity || 30,
          description:
            schoolClass.description || "",
          isActive:
            schoolClass.isActive ?? true,
        });
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load class."
        );
      } finally {
        setLoading(false);
      }
    }

    loadClass();
  }, [id, isEditMode]);

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

  function handleSectionChange(event) {
    const section =
      event.target.value;

    setForm((current) => ({
      ...current,
      section,
      level: "",
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const payload = {
        ...form,
        capacity: Number(
          form.capacity
        ),
      };

      if (isEditMode) {
        await updateClass(
          id,
          payload
        );
      } else {
        await createClass(payload);
      }

      navigate("/admin/classes");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to save class."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading class...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">

      <div>
        <button
          type="button"
          onClick={() =>
            navigate("/admin/classes")
          }
          className="text-sm font-medium text-blue-600"
        >
          ← Back to Classes
        </button>

        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          {isEditMode
            ? "Edit Class"
            : "Add Class"}
        </h1>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >

        <div className="grid gap-5 md:grid-cols-2">

          <FormField
            label="Class Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Primary 1 Gold"
            required
          />

          <FormField
            label="Class Code"
            name="code"
            value={form.code}
            onChange={handleChange}
            placeholder="e.g. PRI1-G"
            required
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Section
            </label>

            <select
              value={form.section}
              onChange={
                handleSectionChange
              }
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="">
                Select Section
              </option>

              <option value="Primary">
                Primary
              </option>

              <option value="Secondary">
                Secondary
              </option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Level
            </label>

            <select
              name="level"
              value={form.level}
              onChange={handleChange}
              disabled={!form.section}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
            >
              <option value="">
                Select Level
              </option>

              {(
                levels[
                  form.section
                ] || []
              ).map((level) => (
                <option
                  key={level}
                  value={level}
                >
                  {level}
                </option>
              ))}
            </select>
          </div>

          <FormField
            label="Capacity"
            type="number"
            name="capacity"
            value={form.capacity}
            onChange={handleChange}
            min="1"
            max="200"
            required
          />

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Optional description..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <label className="flex items-center gap-3 md:col-span-2">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300"
            />

            <span className="text-sm font-medium text-slate-700">
              Active class
            </span>
          </label>

        </div>

        <div className="mt-8 flex justify-end gap-3">

          <button
            type="button"
            onClick={() =>
              navigate("/admin/classes")
            }
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : isEditMode
                ? "Update Class"
                : "Create Class"}
          </button>

        </div>
      </form>
    </div>
  );
}

function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  min,
  max,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}