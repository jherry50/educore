import api from "./api";

export async function getUsers(params = {}) {
  const response = await api.get("/users", {
    params,
  });

  return response.data;
}

export async function getUser(id) {
  const response = await api.get(`/users/${id}`);

  return response.data;
}

export async function createUser(data) {
  const response = await api.post("/users", data);

  return response.data;
}

export async function updateUser(id, data) {
  const response = await api.patch(
    `/users/${id}`,
    data
  );

  return response.data;
}

export async function deleteUser(id) {
  const response = await api.delete(
    `/users/${id}`
  );

  return response.data;
}

export async function getRoles() {
  const response = await api.get("/roles");

  return response.data;
}

export async function getRole(id) {
  const response = await api.get(
    `/roles/${id}`
  );

  return response.data;
}

export async function createRole(data) {
  const response = await api.post(
    "/roles",
    data
  );

  return response.data;
}

export async function updateRole(id, data) {
  const response = await api.patch(
    `/roles/${id}`,
    data
  );

  return response.data;
}

export async function deleteRole(id) {
  const response = await api.delete(
    `/roles/${id}`
  );

  return response.data;
}

export async function getPermissions() {
  const response = await api.get(
    "/permissions"
  );

  return response.data;
}