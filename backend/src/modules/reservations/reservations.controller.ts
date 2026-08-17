import { Request, Response } from "express";
import { reservationsService } from "./reservations.service";
import {
  createReservationSchema,
  listReservationsQuerySchema,
  updateReservationSchema,
} from "./reservations.schema";

export const reservationsController = {
  async create(req: Request, res: Response) {
    const parsed = createReservationSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    try {
      const reserva = await reservationsService.create(req.user!, parsed.data);
      res.status(201).json(reserva);
    } catch (err) {
      res.status(409).json({ error: (err as Error).message });
    }
  },

  async list(req: Request, res: Response) {
    const parsed = listReservationsQuerySchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    res.json(await reservationsService.list(req.user!, parsed.data));
  },

  async getOne(req: Request, res: Response) {
    const reserva = await reservationsService.getById(req.params.id);
    if (!reserva) return res.status(404).json({ error: "Reserva no encontrada" });
    res.json(reserva);
  },

  async update(req: Request, res: Response) {
    const parsed = updateReservationSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    res.json(await reservationsService.update(req.params.id, parsed.data));
  },

  async cancel(req: Request, res: Response) {
    res.json(await reservationsService.cancel(req.params.id));
  },
};
