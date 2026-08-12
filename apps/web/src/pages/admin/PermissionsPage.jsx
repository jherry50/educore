import { useEffect, useState } from "react";

import { getPermissions } from "../../services/admin.service";

export default function PermissionsPage() {
  const [permissions, setPermissions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadPermissions() {
      try {
        const result =
          await getPermissions();

        setPermissions(
          result.data?.permissions || []
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load permissions."
        );
      } finally {
        setLoading(false);
      }
    }

    loadPermissions();
  }, []);

  const grouped =
    permissions.reduce(
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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Permissions
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Available permissions within
          EduCore.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border bg-white p-12 text-center text-sm text-slate-500">
          Loading permissions...
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(
            ([resource, items]) => (
              <div
                key={resource}
                className="rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                  <h2 className="font-semibold capitalize text-slate-900">
                    {resource}
                  </h2>
                </div>

                <div className="divide-y">
                  {items.map(
                    (permission) => (
                      <div
                        key={
                          permission._id
                        }
                        className="flex items-center justify-between px-5 py-4"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {
                              permission.name
                            }
                          </p>

                          <p className="text-xs text-slate-500">
                            {
                              permission.description
                            }
                          </p>
                        </div>

                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium capitalize text-blue-700">
                          {
                            permission.action
                          }
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}