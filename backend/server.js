import connectDB from "./config/db.js";
import { server } from "./app.js";
import { logger } from "./utils/logger.js";

connectDB();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info("server_started", { port: PORT });
});

const shutdown = (signal) => {
  logger.warn("server_shutdown_signal", { signal });
  server.close(() => {
    logger.info("server_stopped", { signal });
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
