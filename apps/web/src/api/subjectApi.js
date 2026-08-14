import api from  "../services/api";

export async function getSubjects(params = {}) {
  const response = await api.get("/subjects", {
    params,
  });

  return response.data;
}

export async function getSubject(id) {
  const response = await api.get(
    `/subjects/${id}`
  );

  return response.data;
}

export async function createSubject(data) {
  const response = await api.post(
    "/subjects",
    data
  );

  return response.data;
}

export async function updateSubject(id, data) {
  const response = await api.patch(
    `/subjects/${id}`,
    data
  );

  return response.data;
}

export async function deleteSubject(id) {
  const response = await api.delete(
    `/subjects/${id}`
  );

  return response.data;
}