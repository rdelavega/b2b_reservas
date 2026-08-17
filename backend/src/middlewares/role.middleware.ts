import { NextFunction, Request, Response } from "express";
import { AuthPayload } from "./auth.middleware";

export function requireRole(...rolesPermitidos: Array<AuthPayload["rol"]>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ error: "No tienes permisos para esta acción" });
    }
    next();
  };
}
