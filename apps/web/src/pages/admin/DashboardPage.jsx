import { useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

export default function Header() {
  const {
    user,
    logout,
  } = useAuth();

  const navigate = useNavigate();

  async function handleLogout() {
    await logout();

    navigate("/login", {
      replace: true,
    });
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      <div>
        <h2 className="font-semibold text-slate-800">
          Administration
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-slate-800">
            {user?.firstName}{" "}
            {user?.lastName}
          </p>

          <p className="text-xs text-slate-500">
            {user?.role?.name}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Logout
        </button>
      </div>
    </header>
  );
}