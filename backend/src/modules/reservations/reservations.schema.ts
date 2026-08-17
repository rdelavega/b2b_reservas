import { z } from "zod";

export const createReservationSchema = z.object({
  sucursalId: z.string().uuid(),
  mesaId: z.string().uuid(),
  clienteId: z.string().uuid().optional(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  horaInicio: z.string().regex(/^\d{2}:\d{2}$/),
  numPersonas: z.number().int().positive(),
  notasEspeciales: z.string().max(500).optional(),
});

export const updateReservationSchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  horaInicio: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  numPersonas: z.number().int().positive().optional(),
  notasEspeciales: z.string().max(500).optional(),
  estado: z.enum(["PENDIENTE", "CONFIRMADA", "CANCELADA", "COMPLETADA"]).optional(),
});

export const listReservationsQuerySchema = z.object({
  sucursalId: z.string().uuid().optional(),
  clienteId: z.string().uuid().optional(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
