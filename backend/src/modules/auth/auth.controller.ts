import { Request, Response } from "express";
import { authService } from "./auth.service";
import { changePasswordSchema, loginSchema, registerSchema } from "./auth.schema";

export const authController = {
  async register(req: Request, res: Response) {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    try {
      const usuario = await authService.register(parsed.data);
      res.status(201).json(usuario);
    } catch (err) {
      res.status(409).json({ error: (err as Error).message });
    }
  },

  async login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    try {
      const resultado = await authService.login(parsed.data.email, parsed.data.password);
      res.json(resultado);
    } catch (err) {
      res.status(401).json({ error: (err as Error).message });
    }
  },

  async changePassword(req: Request, res: Response) {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    try {
      await authService.changePassword(req.user!.id, parsed.data.passwordActual, parsed.data.passwordNueva);
      res.status(204).send();
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  },
};
