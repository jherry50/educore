import { useAuth } from "../../hooks/useAuth";
import StatCard from "../../components/dashboard/StatCard";

export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">

      {/* Welcome */}
      <section>
        <p className="text-sm font-medium text-blue-600">
          Administrator Portal
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Welcome back, {user?.firstName}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Here's what's happening across your school today.
        </p>
      </section>

      {/* Statistics */}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Total Students"
          value="0"
          description="Currently enrolled"
        />

        <StatCard
          title="Total Teachers"
          value="0"
          description="Active teaching staff"
        />

        <StatCard
          title="Total Parents"
          value="0"
          description="Registered parents"
        />

        <StatCard
          title="Total Classes"
          value="0"
          description="Active classes"
        />

      </section>

      {/* Second row */}
      <section className="grid gap-5 lg:grid-cols-2">

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Activities
          </h2>

          <div className="mt-6 flex min-h-40 items-center justify-center text-sm text-slate-400">
            No recent activities.
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Quick Overview
          </h2>

          <div className="mt-6 space-y-4">
            <OverviewRow
              label="Students"
              value="0"
            />

            <OverviewRow
              label="Teachers"
              value="0"
            />

            <OverviewRow
              label="Classes"
              value="0"
            />

            <OverviewRow
              label="Subjects"
              value="0"
            />
          </div>
        </div>

      </section>
    </div>
  );
}

function OverviewRow({
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}