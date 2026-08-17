import { reservationsRepository } from "./reservations.repository";
import { notificationsService } from "../notifications/notifications.service";
import { AuthPayload } from "../../middlewares/auth.middleware";

function sumarMinutos(hora: string, minutos: number): string {
  const [h, m] = hora.split(":").map(Number);
  const total = h * 60 + m + minutos;
  const hh = Math.floor(total / 60).toString().padStart(2, "0");
  const mm = (total % 60).toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

export const reservationsService = {
  async create(
    solicitante: AuthPayload,
    input: {
      sucursalId: string;
      mesaId: string;
      clienteId?: string;
      fecha: string;
      horaInicio: string;
      numPersonas: number;
      notasEspeciales?: string;
    }
  ) {
    const clienteId = solicitante.rol === "CLIENTE" ? solicitante.id : input.clienteId ?? solicitante.id;
    const fecha = new Date(input.fecha);

    const choque = await reservationsRepository.findOverlapping(input.mesaId, fecha, input.horaInicio);
    if (choque) throw new Error("La mesa ya está reservada en ese horario");

    const reserva = await reservationsRepository.create({
      sucursalId: input.sucursalId,
      mesaId: input.mesaId,
      clienteId,
      fecha,
      horaInicio: input.horaInicio,
      horaFin: sumarMinutos(input.horaInicio, 90),
      numPersonas: input.numPersonas,
      notasEspeciales: input.notasEspeciales,
      estado: "PENDIENTE",
    });

    await notificationsService.sendConfirmation(reserva);
    return reserva;
  },

  async list(solicitante: AuthPayload, filtros: { sucursalId?: string; clienteId?: string; fecha?: string }) {
    const where: Record<string, unknown> = {};

    if (solicitante.rol === "CLIENTE") where.clienteId = solicitante.id;
    else if (solicitante.rol === "HOST") where.sucursalId = solicitante.sucursalId ?? "__ninguna__";
    else {
      if (filtros.sucursalId) where.sucursalId = filtros.sucursalId;
      if (filtros.clienteId) where.clienteId = filtros.clienteId;
    }

    if (filtros.fecha) where.fecha = new Date(filtros.fecha);

    return reservationsRepository.findMany(where);
  },

  getById: (id: string) => reservationsRepository.findById(id),

  async update(
    id: string,
    cambios: Partial<{
      fecha: string;
      horaInicio: string;
      numPersonas: number;
      notasEspeciales: string;
      estado: "PENDIENTE" | "CONFIRMADA" | "CANCELADA" | "COMPLETADA";
    }>
  ) {
    const data: Record<string, unknown> = { ...cambios };
    if (cambios.fecha) data.fecha = new Date(cambios.fecha);

    const reserva = await reservationsRepository.update(id, data);

    if (cambios.fecha || cambios.horaInicio) {
      await notificationsService.sendRescheduled(reserva);
    }
    return reserva;
  },

  async cancel(id: string) {
    const reserva = await reservationsRepository.cancel(id);
    await notificationsService.sendCancellation(reserva);
    return reserva;
  },
};
