import { app } from "./app.js";
import { config } from "./config.js";
import { deleteExpiredSessions } from "./repositories/sessionsRepo.js";

const server = app.listen(config.PORT, () => {
  console.log(`Perfume Land backend listening on http://localhost:${config.PORT}`);
  console.log(`Admin CRM: http://localhost:${config.PORT}/admin`);
});

// Belt-and-braces cleanup: expired sessions are already ignored/deleted on
// use and on their owner's next login, but sweep them out periodically too
// so a session table for an admin who never logs in again doesn't grow.
const SESSION_CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
const cleanupTimer = setInterval(() => {
  deleteExpiredSessions().catch((err) => console.error("Session cleanup failed:", err.message));
}, SESSION_CLEANUP_INTERVAL_MS);
cleanupTimer.unref();

function shutdown(signal) {
  console.log(`\n${signal} received, shutting down...`);
  clearInterval(cleanupTimer);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
