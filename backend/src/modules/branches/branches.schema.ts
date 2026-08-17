import { z } from "zod";

export const createBranchSchema = z.object({
  nombre: z.string().min(2),
  direccion: z.string().min(5),
  horaApertura: z.string().regex(/^\d{2}:\d{2}$/),
  horaCierre: z.string().regex(/^\d{2}:\d{2}$/),
  duracionReservaMin: z.number().int().positive().default(90),
});

export const updateBranchSchema = createBranchSchema.partial();

export const createTableSchema = z.object({
  numero: z.number().int().positive(),
  capacidad: z.number().int().positive(),
});

export const availabilityQuerySchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  personas: z.coerce.number().int().positive().default(1),
});
