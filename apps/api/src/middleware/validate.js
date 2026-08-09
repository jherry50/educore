import { BadRequestError } from "../shared/errors/index.js";

export function validate(schema, property = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(
      req[property]
    );

    if (!result.success) {
      const errors =
        result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

      return next(
        new BadRequestError(
          "Validation failed",
          errors
        )
      );
    }

    req[property] = result.data;

    next();
  };
}