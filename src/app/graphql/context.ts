import type { Request } from "express";
import jwt from "jsonwebtoken";

import { envVars } from "@/config/env.js";
import type { UserRole } from "@/modules/User/user.interface.js";

export interface AuthUser {
  id: string;
  phone: string;
  role: UserRole;
}

export interface GraphQLContext {
  req: Request;
  user: AuthUser | null;
}

export function createContext(req: Request): GraphQLContext {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "")
    : null;

  if (!token) {
    return { req, user: null };
  }

  try {
    const decoded = jwt.verify(token, envVars.JWT.ACCESS_SECRET) as AuthUser;
    return { req, user: decoded };
  } catch {
    return { req, user: null };
  }
}
