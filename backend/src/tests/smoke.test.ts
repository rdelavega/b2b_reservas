import "dotenv/config";
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../config/prisma";
import { authService } from "../modules/auth/auth.service";
import { branchesService } from "../modules/branches/branches.service";
import { reservationsService } from "../modules/reservations/reservations.service";

const sufijo = Date.now();
const emailCliente = `cliente.${sufijo}@smoke.test`;
let clienteId: string;
let sucursalId: string;
let mesaId: string;
let reservaId: string;

after(async () => {
  await prisma.reserva.deleteMany({ where: { clienteId } }).catch(() => {});
  await prisma.mesa.deleteMany({ where: { sucursalId } }).catch(() => {});
  await prisma.sucursal.deleteMany({ where: { id: sucursalId } }).catch(() => {});
  await prisma.usuario.deleteMany({ where: { id: clienteId } }).catch(() => {});
  await prisma.$disconnect();
});

test("auth: registro, login y cambio de contraseña", async () => {
  const usuario = await authService.register({
    nombre: "Cliente Smoke",
    email: emailCliente,
    password: "clave123",
    rol: "CLIENTE",
  });
  clienteId = usuario.id;
  assert.equal(usuario.rol, "CLIENTE");

  const { token } = await authService.login(emailCliente, "clave123");
  assert.ok(token);

  await assert.rejects(() => authService.login(emailCliente, "incorrecta"));

  await authService.changePassword(clienteId, "clave123", "clave456");
  const { token: nuevoToken } = await authService.login(emailCliente, "clave456");
  assert.ok(nuevoToken);
});

test("sucursales: alta, consulta, cambio y disponibilidad", async () => {
  const sucursal = await branchesService.createBranch({
    nombre: "Sucursal Smoke",
    direccion: "Av. Prueba 123",
    horaApertura: "12:00",
    horaCierre: "16:00",
    duracionReservaMin: 60,
  });
  sucursalId = sucursal.id;

  const mesa = await branchesService.addTable(sucursalId, 1, 4);
  mesaId = mesa.id;

  const todas = await branchesService.listBranches();
  assert.ok(todas.some((s) => s.id === sucursalId));

  const actualizada = await branchesService.updateBranch(sucursalId, { direccion: "Av. Prueba 456" });
  assert.equal(actualizada.direccion, "Av. Prueba 456");

  const disponibilidad = await branchesService.getAvailability(sucursalId, "2026-09-01", 2);
  const mesaDisponible = disponibilidad.find((d) => d.mesaId === mesaId);
  assert.ok(mesaDisponible);
  assert.ok(mesaDisponible!.slotsLibres.includes("12:00"));
});

test("reservas: alta, consulta, cambio y baja (cancelación)", async () => {
  const solicitante = { id: clienteId, rol: "CLIENTE" as const };

  const reserva = await reservationsService.create(solicitante, {
    sucursalId,
    mesaId,
    fecha: "2026-09-01",
    horaInicio: "12:00",
    numPersonas: 2,
  });
  reservaId = reserva.id;
  assert.equal(reserva.estado, "PENDIENTE");

  await assert.rejects(() =>
    reservationsService.create(solicitante, {
      sucursalId,
      mesaId,
      fecha: "2026-09-01",
      horaInicio: "12:00",
      numPersonas: 2,
    })
  );

  const propias = await reservationsService.list(solicitante, {});
  assert.ok(propias.some((r) => r.id === reservaId));

  const actualizada = await reservationsService.update(reservaId, { numPersonas: 3 });
  assert.equal(actualizada.numPersonas, 3);

  const cancelada = await reservationsService.cancel(reservaId);
  assert.equal(cancelada.estado, "CANCELADA");
});
