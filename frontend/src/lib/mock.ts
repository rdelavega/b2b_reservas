import { Reserva, Usuario } from "./api";

export const mockUsuario: Usuario = {
  id: "demo-usuario",
  nombre: "Ana Torres (demo)",
  rol: "HOST",
};

export const mockReservas: Reserva[] = [
  {
    id: "demo-1",
    sucursalId: "sucursal-centro",
    mesaId: "mesa-4",
    fecha: "2026-08-20",
    horaInicio: "13:30",
    horaFin: "15:00",
    numPersonas: 4,
    estado: "CONFIRMADA",
    notasEspeciales: "Cumpleaños, pastel al final",
  },
  {
    id: "demo-2",
    sucursalId: "sucursal-centro",
    mesaId: "mesa-9",
    fecha: "2026-08-21",
    horaInicio: "20:00",
    horaFin: "21:30",
    numPersonas: 2,
    estado: "PENDIENTE",
    notasEspeciales: null,
  },
  {
    id: "demo-3",
    sucursalId: "sucursal-norte",
    mesaId: "mesa-2",
    fecha: "2026-08-18",
    horaInicio: "14:00",
    horaFin: "15:30",
    numPersonas: 6,
    estado: "CANCELADA",
    notasEspeciales: "Alergia a mariscos",
  },
];
