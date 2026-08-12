import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import { getClasses } from "../../api/classApi";
import {
  createStudent,
  getStudent,
  updateStudent,
} from "../../api/studentApi";

const initialForm = {
  admissionNumber: "",
  firstName: "",
  middleName: "",
  lastName: "",
  gender: "",
  dateOfBirth: "",
  email: "",
  phone: "",
  address: "",
  stateOfOrigin: "",
  nationality: "Nigerian",
  bloodGroup: "",
  genotype: "",
  admissionDate: "",
  status: "active",
  class: ""
};

export default function StudentFormPage() {
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

  const [fieldErrors, setFieldErrors] =
    useState({});
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    async function loadStudent() {
      try {
        setLoading(true);

        const response =
          await getStudent(id);

        const student =
          response.data;

        setForm({
          admissionNumber:
            student.admissionNumber || "",
          firstName:
            student.firstName || "",
          middleName:
            student.middleName || "",
          lastName:
            student.lastName || "",
          gender:
            student.gender || "",
          dateOfBirth:
            student.dateOfBirth
              ? student.dateOfBirth.slice(0, 10)
              : "",
          email:
            student.email || "",
          phone:
            student.phone || "",
          address:
            student.address || "",
          stateOfOrigin:
            student.stateOfOrigin || "",
          nationality:
            student.nationality || "Nigerian",
          bloodGroup:
            student.bloodGroup || "",
          genotype:
            student.genotype || "",
          admissionDate:
            student.admissionDate
              ? student.admissionDate.slice(0, 10)
              : "",
          status:
            student.status || "active",
        });
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load student."
        );
      } finally {
        setLoading(false);
      }
    }

    loadStudent();
  }, [id, isEditMode]);

  useEffect(() => {
  async function loadClasses() {
    try {
      setClassesLoading(true);

      const response = await getClasses({
        isActive: "true",
      });

      setClasses(response.data || []);
    } catch (error) {
      console.error(
        "Failed to load classes:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load classes."
      );
    } finally {
      setClassesLoading(false);
    }
  }

  loadClasses();
}, []);

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [name]: undefined,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setFieldErrors({});

    try {
      if (isEditMode) {
        await updateStudent(
          id,
          form
        );
      } else {
        await createStudent(form);
      }

      navigate("/admin/students");
    } catch (error) {
      const response =
        error.response?.data;

      setError(
        response?.message ||
          "Unable to save student."
      );

      if (response?.errors) {
        setFieldErrors(
          response.errors
        );
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading student...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      <div>
        <button
          type="button"
          onClick={() =>
            navigate("/admin/students")
          }
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Back to Students
        </button>

        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          {isEditMode
            ? "Edit Student"
            : "Add Student"}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          {isEditMode
            ? "Update the student's information."
            : "Create a new student record."}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <FormSection title="Basic Information">

          <FormField
            label="Admission Number"
            name="admissionNumber"
            value={form.admissionNumber}
            onChange={handleChange}
            error={
              fieldErrors.admissionNumber
            }
            required
          />

          <FormField
            label="First Name"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            error={
              fieldErrors.firstName
            }
            required
          />

          <FormField
            label="Middle Name"
            name="middleName"
            value={form.middleName}
            onChange={handleChange}
            error={
              fieldErrors.middleName
            }
          />

          <FormField
            label="Last Name"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            error={
              fieldErrors.lastName
            }
            required
          />

          <SelectField
            label="Gender"
            name="gender"
            value={form.gender}
            onChange={handleChange}
            error={fieldErrors.gender}
            required
            options={[
              {
                value: "Male",
                label: "Male",
              },
              {
                value: "Female",
                label: "Female",
              },
            ]}
          />

          <FormField
            label="Date of Birth"
            type="date"
            name="dateOfBirth"
            value={form.dateOfBirth}
            onChange={handleChange}
            error={
              fieldErrors.dateOfBirth
            }
          />

        </FormSection>

        <FormSection title="Contact Information">

          <FormField
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            error={fieldErrors.email}
          />

          <FormField
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            error={fieldErrors.phone}
          />

          <FormField
            label="State of Origin"
            name="stateOfOrigin"
            value={form.stateOfOrigin}
            onChange={handleChange}
            error={
              fieldErrors.stateOfOrigin
            }
          />

          <FormField
            label="Nationality"
            name="nationality"
            value={form.nationality}
            onChange={handleChange}
            error={
              fieldErrors.nationality
            }
          />

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Address
            </label>

            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            {fieldErrors.address && (
              <p className="mt-1 text-xs text-red-600">
                {fieldErrors.address}
              </p>
            )}
          </div>

        </FormSection>

        <FormSection title="Health Information">

          <SelectField
            label="Blood Group"
            name="bloodGroup"
            value={form.bloodGroup}
            onChange={handleChange}
            error={
              fieldErrors.bloodGroup
            }
            options={[
              "A+",
              "A-",
              "B+",
              "B-",
              "AB+",
              "AB-",
              "O+",
              "O-",
            ].map((value) => ({
              value,
              label: value,
            }))}
          />

          <SelectField
            label="Genotype"
            name="genotype"
            value={form.genotype}
            onChange={handleChange}
            error={fieldErrors.genotype}
            options={[
              "AA",
              "AS",
              "AC",
              "SS",
              "SC",
              "CC",
            ].map((value) => ({
              value,
              label: value,
            }))}
          />

        </FormSection>

        <FormSection title="Admission Information">

          <FormField
            label="Admission Date"
            type="date"
            name="admissionDate"
            value={form.admissionDate}
            onChange={handleChange}
            error={
              fieldErrors.admissionDate
            }
          />

          <SelectField
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            error={fieldErrors.status}
            options={[
              {
                value: "active",
                label: "Active",
              },
              {
                value: "inactive",
                label: "Inactive",
              },
              {
                value: "graduated",
                label: "Graduated",
              },
              {
                value: "withdrawn",
                label: "Withdrawn",
              },
            ]}
          />

          <div>
            <label
                htmlFor="class"
                className="mb-1.5 block text-sm font-medium text-slate-700"
            >
                Class
            </label>

            <select
                id="class"
                name="class"
                value={form.class || ""}
                onChange={handleChange}
                disabled={classesLoading}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
            >
                <option value="">
                {classesLoading
                    ? "Loading classes..."
                    : "Select class"}
                </option>

                {classes.map((schoolClass) => (
                <option
                    key={schoolClass._id}
                    value={schoolClass._id}
                >
                    {schoolClass.name} ({schoolClass.code})
                </option>
                ))}
            </select>

            {!classesLoading && classes.length === 0 && (
                <p className="mt-1.5 text-xs text-amber-600">
                No active classes available. Please create a
                class first.
                </p>
            )}
          </div>

        </FormSection>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() =>
              navigate("/admin/students")
            }
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : isEditMode
                ? "Update Student"
                : "Create Student"}
          </button>
        </div>
      </form>
    </div>
  );
}

function FormSection({
  title,
  children,
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-lg font-semibold text-slate-900">
        {title}
      </h2>

      <div className="grid gap-5 md:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

function FormField({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-100"
            : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
        }`}
      />

      {error && (
        <p className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  error,
  required = false,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-100"
            : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
        }`}
      >
        <option value="">
          Select {label}
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}