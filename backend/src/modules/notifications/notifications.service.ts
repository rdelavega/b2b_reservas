import { reservationEmailTemplate } from "./templates/reservation-email.template";

type Reserva = {
  id: string;
  fecha: Date;
  horaInicio: string;
  numPersonas: number;
};

async function send(asunto: string, html: string) {
  console.log(`[notifications] ${asunto}\n${html}`);
}

export const notificationsService = {
  sendConfirmation(reserva: Reserva) {
    const html = reservationEmailTemplate(
      "Tu reserva fue confirmada",
      "Te esperamos en la fecha y hora indicadas.",
      { Reserva: reserva.id, Fecha: reserva.fecha.toISOString().slice(0, 10), Hora: reserva.horaInicio, Personas: String(reserva.numPersonas) }
    );
    return send("Confirmación de reserva", html);
  },

  sendCancellation(reserva: Reserva) {
    const html = reservationEmailTemplate(
      "Tu reserva fue cancelada",
      "Lamentamos que no puedas asistir. Puedes crear una nueva reserva cuando quieras.",
      { Reserva: reserva.id, Fecha: reserva.fecha.toISOString().slice(0, 10), Hora: reserva.horaInicio }
    );
    return send("Cancelación de reserva", html);
  },

  sendRescheduled(reserva: Reserva) {
    const html = reservationEmailTemplate(
      "Tu reserva fue reprogramada",
      "Estos son los nuevos detalles de tu reserva.",
      { Reserva: reserva.id, Fecha: reserva.fecha.toISOString().slice(0, 10), Hora: reserva.horaInicio, Personas: String(reserva.numPersonas) }
    );
    return send("Reprogramación de reserva", html);
  },
};
