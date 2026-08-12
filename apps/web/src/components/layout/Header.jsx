import { useAuth } from "../../hooks/useAuth";
import { getRoleName } from "../../utils/navigation";

const roleLabels = {
  administrator: "Administrator",
  teacher: "Teacher",
  parent: "Parent",
  student: "Student",
};

export default function Header() {
  const {
    user,
    logout,
  } = useAuth();

  const roleName =
    getRoleName(user);

  const roleLabel =
    roleLabels[roleName] || "User";

  const initials = [
    user?.firstName?.[0],
    user?.lastName?.[0],
  ]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  async function handleLogout() {
    await logout();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      {/* Left */}
      <div>
        <p className="text-sm font-medium text-slate-500">
          {roleLabel} Portal
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-slate-900">
            {user?.firstName}{" "}
            {user?.lastName}
          </p>

          <p className="text-xs text-slate-500">
            {user?.email}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
          {initials || "U"}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 sm:block"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}