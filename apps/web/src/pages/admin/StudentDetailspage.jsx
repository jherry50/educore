import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { getStudent } from "../../api/studentApi";

export default function StudentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadStudent() {
      try {
        const response =
          await getStudent(id);

        setStudent(response.data);
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
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading student...
        </p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-600">
          {error || "Student not found."}
        </p>

        <button
          onClick={() =>
            navigate("/admin/students")
          }
          className="text-sm font-medium text-blue-600"
        >
          ← Back to Students
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/admin/students"
            className="text-sm font-medium text-blue-600"
          >
            ← Back to Students
          </Link>

          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            {student.firstName}{" "}
            {student.middleName}{" "}
            {student.lastName}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {student.admissionNumber}
          </p>
        </div>

        <Link
          to={`/admin/students/${student._id}/edit`}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Edit Student
        </Link>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Personal Information
        </h2>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Info
            label="First Name"
            value={student.firstName}
          />

          <Info
            label="Middle Name"
            value={student.middleName}
          />

          <Info
            label="Last Name"
            value={student.lastName}
          />

          <Info
            label="Gender"
            value={student.gender}
          />

          <Info
            label="Date of Birth"
            value={
              student.dateOfBirth
                ? new Date(
                    student.dateOfBirth
                  ).toLocaleDateString()
                : "—"
            }
          />

          <Info
            label="Nationality"
            value={student.nationality}
          />

          <Info
            label="State of Origin"
            value={student.stateOfOrigin}
          />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Contact Information
        </h2>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <Info
            label="Email"
            value={student.email}
          />

          <Info
            label="Phone"
            value={student.phone}
          />

          <Info
            label="Address"
            value={student.address}
          />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Health Information
        </h2>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <Info
            label="Blood Group"
            value={student.bloodGroup}
          />

          <Info
            label="Genotype"
            value={student.genotype}
          />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Admission Information
        </h2>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Info
            label="Admission Number"
            value={
              student.admissionNumber
            }
          />

          <Info
            label="Admission Date"
            value={
              student.admissionDate
                ? new Date(
                    student.admissionDate
                  ).toLocaleDateString()
                : "—"
            }
          />

          <Info
            label="Status"
            value={student.status}
          />

          <Info
            label="Class"
            value={
              student.class?.name ||
              "Unassigned"
            }
          />

          <Info
            label="Parent"
            value={
              student.parent
                ? `${student.parent.firstName} ${student.parent.lastName}`
                : "Unassigned"
            }
          />
        </div>
      </section>
    </div>
  );
}

function Info({
  label,
  value,
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-900">
        {value || "—"}
      </p>
    </div>
  );
}