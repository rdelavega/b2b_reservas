import { prisma } from "../../config/prisma";
import { Prisma } from "@prisma/client";

export const reservationsRepository = {
  findOverlapping: (mesaId: string, fecha: Date, horaInicio: string) =>
    prisma.reserva.findFirst({
      where: {
        mesaId,
        fecha,
        horaInicio,
        estado: { in: ["PENDIENTE", "CONFIRMADA"] },
      },
    }),

  create: (data: Prisma.ReservaUncheckedCreateInput) => prisma.reserva.create({ data }),

  findById: (id: string) => prisma.reserva.findUnique({ where: { id } }),

  findMany: (where: Prisma.ReservaWhereInput) =>
    prisma.reserva.findMany({ where, orderBy: [{ fecha: "asc" }, { horaInicio: "asc" }] }),

  update: (id: string, data: Prisma.ReservaUpdateInput) => prisma.reserva.update({ where: { id }, data }),

  cancel: (id: string) => prisma.reserva.update({ where: { id }, data: { estado: "CANCELADA" } }),
};
