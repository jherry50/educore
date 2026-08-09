import app from "./app.js";
import { env } from "./config/env.js";
import {
  connectDatabase,
  disconnectDatabase,
} from "./config/database.js";
import logger from "./shared/logger/logger.js";

let server;

async function bootstrap() {
  try {
    await connectDatabase();

    server = app.listen(env.PORT, () => {
      logger.info(`EduCore API running on port ${env.PORT}`);
    });
  } catch (error) {
    logger.fatal(error, "Failed to start EduCore API");
    process.exit(1);
  }
}

async function shutdown(signal) {
  logger.info(`${signal} received. Shutting down...`);

  if (server) {
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  }
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("uncaughtException", (error) => {
  logger.fatal(error, "Uncaught exception");
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  logger.fatal(error, "Unhandled promise rejection");
  process.exit(1);
});

bootstrap();