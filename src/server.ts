import { Server } from "node:http";

import app from "./app.js";
import { envVars } from "@/config/env.js";
import { connectDB, disconnectDB } from "@/config/database.js";

let server: Server;

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception detected. Shutting down...", error);
  process.exit(1);
});

async function bootstrap() {
  try {
    await connectDB();

    server = app.listen(envVars.PORT, () => {
      console.log(`Server is running on PORT: ${envVars.PORT}`);
    });

    process.on("unhandledRejection", (error) => {
      console.error("Unhandled rejection detected. Shutting down...", error);
      server.close(() => process.exit(1));
    });

    process.on("SIGTERM", () => {
      server.close(async () => {
        await disconnectDB();
      });
    });
  } catch (error) {
    console.error("Error during startup:", error);
    process.exit(1);
  }
}

bootstrap();
