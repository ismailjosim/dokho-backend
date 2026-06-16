import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Application, type Request, type Response } from "express";

import { envVars } from "@/config/env.js";
import { createGraphQLHandler } from "@/graphql/index.js";
import globalErrorHandler from "@/middlewares/globalErrorHandler.js";
import notFound from "@/middlewares/notFound.js";

const app: Application = express();

app.use(
  cors({
    origin: envVars.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/graphql", createGraphQLHandler());

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Dokho API is running",
    environment: envVars.NODE_ENV,
    uptime: `${process.uptime().toFixed(2)} sec`,
    timestamp: new Date().toISOString(),
  });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
