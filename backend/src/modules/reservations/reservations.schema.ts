import { z } from "zod";

// Los IDs son cadenas opacas generadas por Prisma (uuid por defecto) o por el
// seed; sólo se exige que no estén vacías.
const id = z.string().min(1);

export const createReservationSchema = z.object({
  sucursalId: id,
  mesaId: id,
  clienteId: id.optional(),
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
  sucursalId: id.optional(),
  clienteId: id.optional(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
