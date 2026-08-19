import api from  "../services/api";

export async function getAttendance(
  params = {}
) {
  const response = await api.get(
    "/attendance",
    {
      params,
    }
  );

  return response.data;
}

export async function getAttendanceById(
  id
) {
  const response = await api.get(
    `/attendance/${id}`
  );

  return response.data;
}

export async function createAttendance(
  data
) {
  const response = await api.post(
    "/attendance",
    data
  );

  return response.data;
}

export async function saveBulkAttendance(
  data
) {
  const response = await api.post(
    "/attendance/bulk",
    data
  );

  return response.data;
}

export async function updateAttendance(
  id,
  data
) {
  const response = await api.patch(
    `/attendance/${id}`,
    data
  );

  return response.data;
}

export async function deleteAttendance(
  id
) {
  const response = await api.delete(
    `/attendance/${id}`
  );

  return response.data;
}