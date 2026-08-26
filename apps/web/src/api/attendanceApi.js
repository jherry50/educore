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

export async function getAttendanceDashboard(
  params = {}
) {
  const response = await api.get(
    "/attendance/dashboard",
    {
      params,
    }
  );

  return response.data;
}

export async function getAttendanceReport(
  params = {}
) {
  const response = await api.get(
    "/attendance/reports",
    {
      params,
    }
  );

  return response.data;
}

export async function getStudentAttendanceStatistics(
  studentId,
  params = {}
) {
  const response = await api.get(
    `/attendance/statistics/student/${studentId}`,
    {
      params,
    }
  );

  return response.data;
}

export async function getClassAttendanceStatistics(
  classId,
  params = {}
) {
  const response = await api.get(
    `/attendance/statistics/class/${classId}`,
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