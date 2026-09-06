import { z } from "zod";

export const registerSchema = z.object({
  nombre: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  rol: z.enum(["ADMIN", "HOST", "CLIENTE"]),
  sucursalId: z.string().min(1).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const changePasswordSchema = z.object({
  passwordActual: z.string().min(1),
  passwordNueva: z.string().min(8),
});
