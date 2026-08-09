import { AppError } from "../shared/errors/index.js";
import { errorResponse } from "../shared/responses/api-response.js";
import logger from "../shared/logger/logger.js";
import { env } from "../config/env.js";

export function errorHandler(error, req, res, next) {
  const isOperationalError = error instanceof AppError;

  const statusCode = isOperationalError
    ? error.statusCode
    : 500;

  const message = isOperationalError
    ? error.message
    : "An unexpected error occurred.";

  const code = isOperationalError
    ? error.code
    : "INTERNAL_SERVER_ERROR";

  logger.error(
    {
      error,
      method: req.method,
      path: req.originalUrl,
    },
    error.message
  );

  const response = {
    statusCode,
    message,
    code,
  };

  if (isOperationalError && error.details) {
    response.errors = error.details;
  }

  if (env.NODE_ENV !== "production" && !isOperationalError) {
    response.errors = [
      {
        message: error.message,
      },
    ];
  }

  return errorResponse(res, response);
}