import "dotenv/config";
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import { app } from "../app";
import { prisma } from "../config/prisma";

/**
 * Prueba de humo de integración FRONTEND <-> BACKEND (Fase 4).
 *
 * Levanta la API real en un puerto efímero y ejercita, por HTTP, exactamente
 * los endpoints que consume `frontend/src/lib/api.ts`, en el mismo orden en que
 * los usan las pantallas: registro -> login -> perfil -> alta de sucursal y
 * mesa -> disponibilidad -> alta/consulta/cambio/confirmación/baja de reserva
 * -> cambio de contraseña.
 */

let server: Server;
let baseUrl: string;

const sufijo = Date.now();
const emailAdmin = `admin.${sufijo}@smoke.test`;
const emailCliente = `cliente.${sufijo}@smoke.test`;
const idsUsuarios: string[] = [];
let sucursalId = "";
let mesaId = "";
let reservaId = "";

async function api<T>(
  path: string,
  opts: { method?: string; token?: string; body?: unknown } = {}
): Promise<{ status: number; body: T }> {
  const res = await fetch(`${baseUrl}${path}`, {
    method: opts.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const texto = await res.text();
  return { status: res.status, body: texto ? JSON.parse(texto) : (undefined as T) };
}

before(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const dir = server.address();
      const port = typeof dir === "object" && dir ? dir.port : 0;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  await prisma.reserva.deleteMany({ where: { id: reservaId } }).catch(() => {});
  await prisma.mesa.deleteMany({ where: { sucursalId } }).catch(() => {});
  await prisma.sucursal.deleteMany({ where: { id: sucursalId } }).catch(() => {});
  await prisma.usuario.deleteMany({ where: { id: { in: idsUsuarios } } }).catch(() => {});
  await prisma.$disconnect();
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

test("salud del backend", async () => {
  const { status, body } = await api<{ status: string }>("/health");
  assert.equal(status, 200);
  assert.equal(body.status, "ok");
});

test("auth: registro, login y perfil (/auth/me)", async () => {
  const admin = await api<{ id: string }>("/auth/register", {
    method: "POST",
    body: { nombre: "Admin Smoke", email: emailAdmin, password: "clave1234", rol: "ADMIN" },
  });
  assert.equal(admin.status, 201);
  idsUsuarios.push(admin.body.id);

  const login = await api<{ token: string; usuario: { rol: string } }>("/auth/login", {
    method: "POST",
    body: { email: emailAdmin, password: "clave1234" },
  });
  assert.equal(login.status, 200);
  assert.ok(login.body.token);
  assert.equal(login.body.usuario.rol, "ADMIN");

  const me = await api<{ email: string; rol: string }>("/auth/me", { token: login.body.token });
  assert.equal(me.status, 200);
  assert.equal(me.body.email, emailAdmin);
  assert.equal(me.body.rol, "ADMIN");

  const sinToken = await api("/auth/me");
  assert.equal(sinToken.status, 401);
});

test("sucursales: alta de sucursal y mesa, listado y disponibilidad", async () => {
  const { token } = (
    await api<{ token: string }>("/auth/login", {
      method: "POST",
      body: { email: emailAdmin, password: "clave1234" },
    })
  ).body;

  const sucursal = await api<{ id: string }>("/branches", {
    method: "POST",
    token,
    body: {
      nombre: `Sucursal Smoke ${sufijo}`,
      direccion: "Av. Integración 123",
      horaApertura: "12:00",
      horaCierre: "16:00",
      duracionReservaMin: 60,
    },
  });
  assert.equal(sucursal.status, 201);
  sucursalId = sucursal.body.id;

  const mesa = await api<{ id: string }>(`/branches/${sucursalId}/mesas`, {
    method: "POST",
    token,
    body: { numero: 1, capacidad: 4 },
  });
  assert.equal(mesa.status, 201);
  mesaId = mesa.body.id;

  const lista = await api<Array<{ id: string }>>("/branches");
  assert.equal(lista.status, 200);
  assert.ok(lista.body.some((s) => s.id === sucursalId));

  const disp = await api<Array<{ mesaId: string; slotsLibres: string[] }>>(
    `/branches/${sucursalId}/availability?fecha=2026-10-01&personas=2`
  );
  assert.equal(disp.status, 200);
  const mesaDisp = disp.body.find((m) => m.mesaId === mesaId);
  assert.ok(mesaDisp);
  assert.ok(mesaDisp!.slotsLibres.includes("12:00"));
});

test("reservas: alta, consulta con relaciones, cambio, confirmación y baja", async () => {
  const cliente = await api<{ id: string }>("/auth/register", {
    method: "POST",
    body: { nombre: "Cliente Smoke", email: emailCliente, password: "clave1234", rol: "CLIENTE" },
  });
  assert.equal(cliente.status, 201);
  idsUsuarios.push(cliente.body.id);

  const { token } = (
    await api<{ token: string }>("/auth/login", {
      method: "POST",
      body: { email: emailCliente, password: "clave1234" },
    })
  ).body;

  const reserva = await api<{ id: string; estado: string }>("/reservations", {
    method: "POST",
    token,
    body: {
      sucursalId,
      mesaId,
      fecha: "2026-10-01",
      horaInicio: "12:00",
      numPersonas: 2,
      notasEspeciales: "Prueba de humo",
    },
  });
  assert.equal(reserva.status, 201);
  assert.equal(reserva.body.estado, "PENDIENTE");
  reservaId = reserva.body.id;

  const choque = await api("/reservations", {
    method: "POST",
    token,
    body: { sucursalId, mesaId, fecha: "2026-10-01", horaInicio: "12:00", numPersonas: 2 },
  });
  assert.equal(choque.status, 409);

  const lista = await api<Array<{ id: string; sucursal?: { nombre: string }; mesa?: { numero: number } }>>(
    "/reservations",
    { token }
  );
  assert.equal(lista.status, 200);
  const enLista = lista.body.find((r) => r.id === reservaId);
  assert.ok(enLista, "la reserva aparece en el listado del cliente");
  assert.ok(enLista!.sucursal?.nombre, "el listado incluye la sucursal");
  assert.equal(typeof enLista!.mesa?.numero, "number", "el listado incluye la mesa");

  const detalle = await api<{ id: string }>(`/reservations/${reservaId}`, { token });
  assert.equal(detalle.status, 200);
  assert.equal(detalle.body.id, reservaId);

  const editada = await api<{ numPersonas: number }>(`/reservations/${reservaId}`, {
    method: "PATCH",
    token,
    body: { numPersonas: 3 },
  });
  assert.equal(editada.status, 200);
  assert.equal(editada.body.numPersonas, 3);

  const confirmada = await api<{ estado: string }>(`/reservations/${reservaId}`, {
    method: "PATCH",
    token,
    body: { estado: "CONFIRMADA" },
  });
  assert.equal(confirmada.status, 200);
  assert.equal(confirmada.body.estado, "CONFIRMADA");

  const cancelada = await api<{ estado: string }>(`/reservations/${reservaId}`, {
    method: "DELETE",
    token,
  });
  assert.equal(cancelada.status, 200);
  assert.equal(cancelada.body.estado, "CANCELADA");
});

test("auth: cambio de contraseña y bloqueo sin token", async () => {
  const { token } = (
    await api<{ token: string }>("/auth/login", {
      method: "POST",
      body: { email: emailCliente, password: "clave1234" },
    })
  ).body;

  const cambio = await api(`/auth/password`, {
    method: "PATCH",
    token,
    body: { passwordActual: "clave1234", passwordNueva: "clave5678" },
  });
  assert.equal(cambio.status, 204);

  const nuevoLogin = await api<{ token: string }>("/auth/login", {
    method: "POST",
    body: { email: emailCliente, password: "clave5678" },
  });
  assert.equal(nuevoLogin.status, 200);
  assert.ok(nuevoLogin.body.token);

  const reservasSinToken = await api("/reservations");
  assert.equal(reservasSinToken.status, 401);
});
