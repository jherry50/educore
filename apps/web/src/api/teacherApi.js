import api from "../services/api";

export async function getTeachers(params = {}) {
  const response = await api.get("/teachers", {
    params,
  });

  return response.data;
}

export async function getTeacher(id) {
  const response = await api.get(`/teachers/${id}`);

  return response.data;
}

export async function createTeacher(data) {
  const response = await api.post("/teachers", data);

  return response.data;
}

export async function updateTeacher(id, data) {
  const response = await api.patch(
    `/teachers/${id}`,
    data
  );

  return response.data;
}

export async function deleteTeacher(id) {
  const response = await api.delete(
    `/teachers/${id}`
  );

  return response.data;
}