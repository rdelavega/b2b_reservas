import { branchesRepository } from "./branches.repository";
import { minutosDesde, horaDesdeMinutos } from "../../lib/time";

export const branchesService = {
  listBranches: () => branchesRepository.findAll(),

  getBranch: (id: string) => branchesRepository.findById(id),

  createBranch: branchesRepository.create,

  updateBranch: branchesRepository.update,

  deleteBranch: branchesRepository.remove,

  addTable: (sucursalId: string, numero: number, capacidad: number) =>
    branchesRepository.addTable(sucursalId, numero, capacidad),

  removeTable: branchesRepository.removeTable,

  async getAvailability(sucursalId: string, fecha: string, personas: number) {
    const sucursal = await branchesRepository.findById(sucursalId);
    if (!sucursal) throw new Error("Sucursal no encontrada");

    const reservasDelDia = await branchesRepository.findReservationsForDate(sucursalId, new Date(fecha));
    const mesasAptas = sucursal.mesas.filter((m) => m.capacidad >= personas);

    const inicio = minutosDesde(sucursal.horaApertura);
    const fin = minutosDesde(sucursal.horaCierre);
    const duracion = sucursal.duracionReservaMin;

    return mesasAptas.map((mesa) => {
      const ocupados = reservasDelDia
        .filter((r) => r.mesaId === mesa.id)
        .map((r) => minutosDesde(r.horaInicio));

      const slotsLibres: string[] = [];
      for (let t = inicio; t + duracion <= fin; t += duracion) {
        if (!ocupados.includes(t)) slotsLibres.push(horaDesdeMinutos(t));
      }

      return { mesaId: mesa.id, numero: mesa.numero, capacidad: mesa.capacidad, slotsLibres };
    });
  },
};
