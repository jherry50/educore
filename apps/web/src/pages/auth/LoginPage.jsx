import { useState } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

import {
  getDefaultRoute,
  canAccessRoleArea,
} from "../../utils/roleRoutes";

export default function LoginPage() {
  const {
    login,
    user,
    isAuthenticated,
    loading,
  } = useAuth();

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [form, setForm] =
    useState({
      email: "",
      password: "",
    });

  const [error, setError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  if (loading) {
    return null;
  }

  /*
   * If the user is already authenticated,
   * send them to the correct role area.
   */
  if (isAuthenticated) {
    return (
      <Navigate
        to={getDefaultRoute(user)}
        replace
      />
    );
  }

  function handleChange(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]:
        event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      /*
       * login() returns the authenticated
       * user from AuthContext.
       */
      const authenticatedUser =
        await login(form);

      /*
       * If the user originally tried to
       * access a route belonging to their
       * own role, return them there.
       *
       * Otherwise send them to their
       * role's default dashboard.
       */
      const requestedPath =
        location.state?.from?.pathname;

      const destination =
        requestedPath &&
        canAccessRoleArea(
          authenticatedUser,
          requestedPath
        )
          ? requestedPath
          : getDefaultRoute(
              authenticatedUser
            );

      navigate(destination, {
        replace: true,
      });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Unable to sign in.";

      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-lg">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900">
              EduCore
            </h1>

            <p className="mt-2 text-slate-500">
              School Management System
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="admin@educore.local"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Signing in..."
                : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}