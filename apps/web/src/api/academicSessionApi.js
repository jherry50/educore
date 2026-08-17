import api from "../services/api";

export async function getAcademicSessions(
  params = {}
) {
  const response = await api.get(
    "/academic-sessions",
    {
      params,
    }
  );

  return response.data;
}

export async function getAcademicSession(id) {
  const response = await api.get(
    `/academic-sessions/${id}`
  );

  return response.data;
}

export async function createAcademicSession(
  data
) {
  const response = await api.post(
    "/academic-sessions",
    data
  );

  return response.data;
}

export async function updateAcademicSession(
  id,
  data
) {
  const response = await api.patch(
    `/academic-sessions/${id}`,
    data
  );

  return response.data;
}

export async function activateAcademicSession(
  id
) {
  const response = await api.patch(
    `/academic-sessions/${id}/activate`
  );

  return response.data;
}

export async function completeAcademicSession(
  id
) {
  const response = await api.patch(
    `/academic-sessions/${id}/complete`
  );

  return response.data;
}

export async function deleteAcademicSession(
  id
) {
  const response = await api.delete(
    `/academic-sessions/${id}`
  );

  return response.data;
}