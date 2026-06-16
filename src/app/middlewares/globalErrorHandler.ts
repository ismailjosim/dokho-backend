import type { NextFunction, Request, Response } from "express";
import HttpStatus from "http-status";
import mongoose from "mongoose";
import { ZodError } from "zod";

import AppError from "@/helpers/AppError.js";

const globalErrorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let statusCode = Number(HttpStatus.INTERNAL_SERVER_ERROR);
  let message = "Something went wrong!";
  let errorDetails: unknown = null;

  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = Number(HttpStatus.BAD_REQUEST);
    message = "Request validation failed";
    errorDetails = Object.values(err.errors).map((error) => error.message);
  } else if (err instanceof ZodError) {
    statusCode = Number(HttpStatus.BAD_REQUEST);
    message = "Request validation failed";
    errorDetails = err.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: errorDetails,
    ...(process.env.NODE_ENV === "development" && err instanceof Error
      ? { stack: err.stack }
      : {}),
  });
};

export default globalErrorHandler;
