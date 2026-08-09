import api from "./api";

export async function login(credentials) {
  const response = await api.post(
    "/auth/login",
    credentials
  );

  return response.data;
}

export async function refreshToken() {
  const response = await api.post(
    "/auth/refresh"
  );

  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get(
    "/auth/me"
  );

  return response.data;
}

export async function logout() {
  const response = await api.post(
    "/auth/logout"
  );

  return response.data;
}