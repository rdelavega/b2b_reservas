import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authController } from "./auth.controller";
import { requireAuth } from "../../middlewares/auth.middleware";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { error: "Demasiados intentos de inicio de sesión, intenta más tarde" },
});

export const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", loginLimiter, authController.login);
authRouter.get("/me", requireAuth, authController.me);
authRouter.patch("/password", requireAuth, authController.changePassword);
