import { useAuth } from "../../hooks/useAuth";
import StatCard from "../../components/dashboard/StatCard";

export default function StudentDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">

      <section>
        <p className="text-sm font-medium text-blue-600">
          Student Portal
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Welcome back, {user?.firstName}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Here's an overview of your academic performance.
        </p>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Attendance"
          value="0%"
          description="Current attendance"
        />

        <StatCard
          title="Average Score"
          value="—"
          description="Current average"
        />

        <StatCard
          title="Subjects"
          value="0"
          description="Registered subjects"
        />

        <StatCard
          title="Class Position"
          value="—"
          description="Current position"
        />

      </section>

      <section className="grid gap-5 lg:grid-cols-2">

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Results
          </h2>

          <div className="mt-6 flex min-h-40 items-center justify-center text-sm text-slate-400">
            No results available.
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Attendance Overview
          </h2>

          <div className="mt-6 flex min-h-40 items-center justify-center text-sm text-slate-400">
            No attendance records available.
          </div>
        </div>

      </section>
    </div>
  );
}