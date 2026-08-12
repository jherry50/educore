import { useEffect, useState } from "react";

import {
  createUser,
  deleteUser,
  getRoles,
  getUsers,
  updateUser,
} from "../../services/admin.service";

import { useAuth } from "../../hooks/useAuth";

import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  role: "",
  isActive: true,
};

export default function UsersPage() {
  const {
    hasPermission,
  } = useAuth();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [pagination, setPagination] =
    useState({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
    });

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingUser, setEditingUser] =
    useState(null);

  const [form, setForm] =
    useState(initialForm);

  const [saving, setSaving] =
    useState(false);

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  const [deleting, setDeleting] =
    useState(false);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const result = await getUsers({
        page,
        limit: 10,
        search,
      });

      setUsers(result.data || []);
      setPagination(
        result.meta || {
          page,
          limit: 10,
          total: 0,
          totalPages: 1,
        }
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadRoles() {
    try {
      const result = await getRoles();

      setRoles(result.data?.roles || []);
    } catch (err) {
      console.error(
        "Unable to load roles",
        err
      );
    }
  }

  useEffect(() => {
    loadUsers();
  }, [page, search]);

  useEffect(() => {
    loadRoles();
  }, []);

  function openCreateModal() {
    setEditingUser(null);

    setForm({
      ...initialForm,
      role: roles[0]?._id || "",
    });

    setModalOpen(true);
  }

  function openEditModal(user) {
    setEditingUser(user);

    setForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      role: user.role?._id || "",
      isActive: user.isActive,
    });

    setModalOpen(true);
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingUser(null);
    setForm(initialForm);
  }

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

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editingUser) {
        const payload = {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          role: form.role,
          isActive: form.isActive,
        };

        await updateUser(
          editingUser.id || editingUser._id,
          payload
        );
      } else {
        await createUser(form);
      }

      closeModal();

      await loadUsers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save user."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    try {
      setDeleting(true);

      await deleteUser(
        deleteTarget.id ||
          deleteTarget._id
      );

      setDeleteTarget(null);

      await loadUsers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete user."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Users
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage users and their access to
            EduCore.
          </p>
        </div>

        {hasPermission("users.create") && (
          <button
            onClick={openCreateModal}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Add User
          </button>
        )}
      </div>

      {error && (
        <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <input
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Search by name or email..."
            className="w-full max-w-md rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="px-5 py-4">
                  User
                </th>

                <th className="px-5 py-4">
                  Role
                </th>

                <th className="px-5 py-4">
                  Status
                </th>

                <th className="px-5 py-4">
                  Last Login
                </th>

                <th className="px-5 py-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <UserRow
                    key={
                      user.id ||
                      user._id
                    }
                    user={user}
                    canEdit={hasPermission(
                      "users.update"
                    )}
                    canDelete={hasPermission(
                      "users.delete"
                    )}
                    onEdit={() =>
                      openEditModal(user)
                    }
                    onDelete={() =>
                      setDeleteTarget(
                        user
                      )
                    }
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
          <p className="text-sm text-slate-500">
            {pagination.total} user
            {pagination.total === 1
              ? ""
              : "s"}
          </p>

          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() =>
                setPage(
                  (current) =>
                    current - 1
                )
              }
              className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <span className="px-2 py-2 text-sm text-slate-500">
              {page} /{" "}
              {pagination.totalPages}
            </span>

            <button
              disabled={
                page >=
                pagination.totalPages
              }
              onClick={() =>
                setPage(
                  (current) =>
                    current + 1
                )
              }
              className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={
          editingUser
            ? "Edit User"
            : "Create User"
        }
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="First name"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
            />

            <FormField
              label="Last name"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </div>

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

          {!editingUser && (
            <FormField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Role
            </label>

            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500"
            >
              <option value="">
                Select role
              </option>

              {roles.map((role) => (
                <option
                  key={role._id}
                  value={role._id}
                >
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {editingUser && (
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="h-4 w-4 rounded"
              />

              <span className="text-sm text-slate-700">
                Account is active
              </span>
            </label>
          )}

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingUser
                ? "Save Changes"
                : "Create User"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete user"
        message={
          deleteTarget
            ? `Are you sure you want to delete ${deleteTarget.firstName} ${deleteTarget.lastName}? This action cannot be undone.`
            : ""
        }
        confirmText="Delete User"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() =>
          setDeleteTarget(null)
        }
      />
    </div>
  );
}

function UserRow({
  user,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}) {
  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
            {user.firstName?.[0]}
            {user.lastName?.[0]}
          </div>

          <div>
            <p className="font-medium text-slate-900">
              {user.firstName}{" "}
              {user.lastName}
            </p>

            <p className="text-sm text-slate-500">
              {user.email}
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4 text-sm text-slate-600">
        {user.role?.name || "—"}
      </td>

      <td className="px-5 py-4">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            user.isActive
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {user.isActive
            ? "Active"
            : "Inactive"}
        </span>
      </td>

      <td className="px-5 py-4 text-sm text-slate-500">
        {user.lastLoginAt
          ? new Date(
              user.lastLoginAt
            ).toLocaleString()
          : "Never"}
      </td>

      <td className="px-5 py-4">
        <div className="flex justify-end gap-2">
          {canEdit && (
            <button
              onClick={onEdit}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
            >
              Edit
            </button>
          )}

          {canDelete && (
            <button
              onClick={onDelete}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}