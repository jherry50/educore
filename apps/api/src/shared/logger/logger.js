import pino from "pino";
import { env } from "../../config/env.js";

const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",

  ...(env.NODE_ENV !== "production" && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
      },
    },
  }),
});

export default logger;