import { useEffect, useState } from "react";

import {
  createRole,
  deleteRole,
  getPermissions,
  getRoles,
  updateRole,
} from "../../services/admin.service";

import { useAuth } from "../../hooks/useAuth";

import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

export default function RolesPage() {
  const {
    hasPermission,
  } = useAuth();

  const [roles, setRoles] =
    useState([]);

  const [permissions, setPermissions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingRole, setEditingRole] =
    useState(null);

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [form, setForm] =
    useState({
      name: "",
      description: "",
      permissions: [],
      isActive: true,
    });

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        rolesResult,
        permissionsResult,
      ] = await Promise.all([
        getRoles(),
        getPermissions(),
      ]);

      setRoles(
        rolesResult.data?.roles || []
      );

      setPermissions(
        permissionsResult.data
          ?.permissions || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load role data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openCreateModal() {
    setEditingRole(null);

    setForm({
      name: "",
      description: "",
      permissions: [],
      isActive: true,
    });

    setModalOpen(true);
  }

  function openEditModal(role) {
    setEditingRole(role);

    setForm({
      name: role.name || "",
      description:
        role.description || "",
      permissions:
        role.permissions?.map(
          (permission) =>
            permission._id
        ) || [],
      isActive: role.isActive,
    });

    setModalOpen(true);
  }

  function togglePermission(id) {
    setForm((current) => {
      const exists =
        current.permissions.includes(
          id
        );

      return {
        ...current,
        permissions: exists
          ? current.permissions.filter(
              (item) => item !== id
            )
          : [
              ...current.permissions,
              id,
            ],
      };
    });
  }

  function selectAll() {
    setForm((current) => ({
      ...current,
      permissions:
        permissions.map(
          (permission) =>
            permission._id
        ),
    }));
  }

  function clearAll() {
    setForm((current) => ({
      ...current,
      permissions: [],
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editingRole) {
        await updateRole(
          editingRole._id,
          form
        );
      } else {
        await createRole(form);
      }

      setModalOpen(false);

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save role."
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

      await deleteRole(
        deleteTarget._id
      );

      setDeleteTarget(null);

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete role."
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
            Roles
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Define what users can access
            within EduCore.
          </p>
        </div>

        {hasPermission("roles.create") && (
          <button
            onClick={openCreateModal}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Create Role
          </button>
        )}
      </div>

      {error && (
        <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">
            Loading roles...
          </div>
        ) : roles.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            No roles found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-4">
                    Role
                  </th>

                  <th className="px-5 py-4">
                    Permissions
                  </th>

                  <th className="px-5 py-4">
                    Type
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {roles.map((role) => (
                  <tr
                    key={role._id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">
                        {role.name}
                      </p>

                      <p className="text-sm text-slate-500">
                        {role.description ||
                          "No description"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {role.permissions
                        ?.length || 0}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {role.isSystem
                          ? "System"
                          : "Custom"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          role.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {role.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        {hasPermission(
                          "roles.update"
                        ) && (
                          <button
                            onClick={() =>
                              openEditModal(
                                role
                              )
                            }
                            className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                          >
                            Edit
                          </button>
                        )}

                        {!role.isSystem &&
                          hasPermission(
                            "roles.delete"
                          ) && (
                            <button
                              onClick={() =>
                                setDeleteTarget(
                                  role
                                )
                              }
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() =>
          !saving &&
          setModalOpen(false)
        }
        title={
          editingRole
            ? "Edit Role"
            : "Create Role"
        }
        size="xl"
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Role name
              </label>

              <input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                required
                disabled={
                  editingRole?.isSystem
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </label>

              <input
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description:
                      event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">
                  Permissions
                </h3>

                <p className="text-sm text-slate-500">
                  Select what this role can
                  access.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Select all
                </button>

                <button
                  type="button"
                  onClick={clearAll}
                  className="text-sm font-medium text-slate-500 hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>

            <PermissionMatrix
              permissions={permissions}
              selected={
                form.permissions
              }
              onToggle={
                togglePermission
              }
            />
          </div>

          <div className="flex justify-end gap-3 border-t pt-5">
            <button
              type="button"
              onClick={() =>
                setModalOpen(false)
              }
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
                : editingRole
                ? "Save Changes"
                : "Create Role"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete role"
        message={
          deleteTarget
            ? `Delete the "${deleteTarget.name}" role?`
            : ""
        }
        confirmText="Delete Role"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() =>
          setDeleteTarget(null)
        }
      />
    </div>
  );
}

function PermissionMatrix({
  permissions,
  selected,
  onToggle,
}) {
  const grouped = permissions.reduce(
    (result, permission) => {
      if (!result[permission.resource]) {
        result[permission.resource] =
          [];
      }

      result[permission.resource].push(
        permission
      );

      return result;
    },
    {}
  );

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      {Object.entries(grouped).map(
        ([resource, items]) => (
          <div
            key={resource}
            className="border-b border-slate-200 last:border-0"
          >
            <div className="bg-slate-50 px-4 py-3">
              <span className="font-semibold capitalize text-slate-800">
                {resource}
              </span>
            </div>

            <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-4">
              {items.map(
                (permission) => (
                  <label
                    key={permission._id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(
                        permission._id
                      )}
                      onChange={() =>
                        onToggle(
                          permission._id
                        )
                      }
                      className="mt-0.5 h-4 w-4 rounded"
                    />

                    <div>
                      <p className="text-sm font-medium capitalize text-slate-800">
                        {
                          permission.action
                        }
                      </p>

                      <p className="text-xs text-slate-500">
                        {permission.name}
                      </p>
                    </div>
                  </label>
                )
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}