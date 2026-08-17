import { prisma } from "../../config/prisma";

export const branchesRepository = {
  findAll: () => prisma.sucursal.findMany({ include: { mesas: true } }),

  findById: (id: string) => prisma.sucursal.findUnique({ where: { id }, include: { mesas: true } }),

  create: (data: {
    nombre: string;
    direccion: string;
    horaApertura: string;
    horaCierre: string;
    duracionReservaMin?: number;
  }) => prisma.sucursal.create({ data }),

  update: (id: string, data: Partial<{
    nombre: string;
    direccion: string;
    horaApertura: string;
    horaCierre: string;
    duracionReservaMin: number;
  }>) => prisma.sucursal.update({ where: { id }, data }),

  remove: (id: string) => prisma.sucursal.delete({ where: { id } }),

  addTable: (sucursalId: string, numero: number, capacidad: number) =>
    prisma.mesa.create({ data: { sucursalId, numero, capacidad } }),

  removeTable: (mesaId: string) => prisma.mesa.delete({ where: { id: mesaId } }),

  findReservationsForDate: (sucursalId: string, fecha: Date) =>
    prisma.reserva.findMany({
      where: {
        sucursalId,
        fecha,
        estado: { in: ["PENDIENTE", "CONFIRMADA"] },
      },
    }),
};
