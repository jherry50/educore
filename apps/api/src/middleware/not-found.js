import { NotFoundError } from "../shared/errors/index.js";

export function notFoundHandler(req, res, next) {
  next(
    new NotFoundError(
      `Route ${req.method} ${req.originalUrl} not found`
    )
  );
}