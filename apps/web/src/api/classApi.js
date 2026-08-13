import api from  "../services/api";

export async function getClasses(
  params = {}
) {
  const response =
    await api.get("/classes", {
      params,
    });

  return response.data;
}

export async function getClass(id) {
  const response =
    await api.get(`/classes/${id}`);

  return response.data;
}

export async function createClass(data) {
  const response =
    await api.post(
      "/classes",
      data
    );

  return response.data;
}

export async function assignClassTeacher(
  classId,
  teacherId
) {
  const response = await api.patch(
    `/classes/${classId}/teacher`,
    {
      teacherId,
    }
  );

  return response.data;
}

export async function updateClass(
  id,
  data
) {
  const response =
    await api.patch(
      `/classes/${id}`,
      data
    );

  return response.data;
}

export async function deleteClass(id) {
  const response =
    await api.delete(
      `/classes/${id}`
    );

  return response.data;
}