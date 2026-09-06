import { prisma } from "../../config/prisma";
import { Prisma } from "@prisma/client";

const includeRelaciones = {
  sucursal: { select: { id: true, nombre: true, direccion: true } },
  mesa: { select: { id: true, numero: true, capacidad: true } },
} satisfies Prisma.ReservaInclude;

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

  create: (data: Prisma.ReservaUncheckedCreateInput) =>
    prisma.reserva.create({ data, include: includeRelaciones }),

  findById: (id: string) =>
    prisma.reserva.findUnique({ where: { id }, include: includeRelaciones }),

  findMany: (where: Prisma.ReservaWhereInput) =>
    prisma.reserva.findMany({
      where,
      orderBy: [{ fecha: "asc" }, { horaInicio: "asc" }],
      include: includeRelaciones,
    }),

  update: (id: string, data: Prisma.ReservaUpdateInput) =>
    prisma.reserva.update({ where: { id }, data, include: includeRelaciones }),

  cancel: (id: string) =>
    prisma.reserva.update({
      where: { id },
      data: { estado: "CANCELADA" },
      include: includeRelaciones,
    }),
};
