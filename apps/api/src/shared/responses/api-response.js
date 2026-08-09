export function successResponse(
  res,
  {
    statusCode = 200,
    message = "Request successful",
    data = null,
    meta = null,
  } = {}
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  });
}

export function errorResponse(
  res,
  {
    statusCode = 500,
    message = "Internal server error",
    code = "INTERNAL_SERVER_ERROR",
    errors = null,
  } = {}
) {
  return res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(errors ? { errors } : {}),
  });
}