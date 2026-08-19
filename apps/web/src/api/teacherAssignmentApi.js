import api from "../services/api";

export async function getTeacherAssignments(
  params = {}
) {
  const response = await api.get(
    "/teacher-assignments",
    {
      params,
    }
  );

  return response.data;
}

export async function getTeacherAssignment(
  id
) {
  const response = await api.get(
    `/teacher-assignments/${id}`
  );

  return response.data;
}

export async function getMyTeacherAssignments(
  params = {}
) {
  const response = await api.get(
    "/teacher-assignments/my-assignments",
    {
      params,
    }
  );

  return response.data;
}

export async function createTeacherAssignment(
  data
) {
  const response = await api.post(
    "/teacher-assignments",
    data
  );

  return response.data;
}

export async function updateTeacherAssignment(
  id,
  data
) {
  const response = await api.patch(
    `/teacher-assignments/${id}`,
    data
  );

  return response.data;
}

export async function deleteTeacherAssignment(
  id
) {
  const response = await api.delete(
    `/teacher-assignments/${id}`
  );

  return response.data;
}