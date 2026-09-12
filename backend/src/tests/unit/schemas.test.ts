import { test } from "node:test";
import assert from "node:assert/strict";
import { createReservationSchema, updateReservationSchema } from "../../modules/reservations/reservations.schema";
import { registerSchema } from "../../modules/auth/auth.schema";
import { createBranchSchema } from "../../modules/branches/branches.schema";

test("createReservationSchema acepta un payload válido", () => {
  const parsed = createReservationSchema.safeParse({
    sucursalId: "seed-sucursal-centro",
    mesaId: "mesa-1",
    fecha: "2026-10-01",
    horaInicio: "12:00",
    numPersonas: 2,
  });
  assert.equal(parsed.success, true);
});

test("createReservationSchema rechaza fecha y hora con formato incorrecto", () => {
  const parsed = createReservationSchema.safeParse({
    sucursalId: "s1",
    mesaId: "m1",
    fecha: "01/10/2026",
    horaInicio: "12h00",
    numPersonas: 2,
  });
  assert.equal(parsed.success, false);
  if (!parsed.success) {
    const campos = parsed.error.flatten().fieldErrors;
    assert.ok(campos.fecha);
    assert.ok(campos.horaInicio);
  }
});

test("createReservationSchema rechaza numPersonas no positivo", () => {
  const parsed = createReservationSchema.safeParse({
    sucursalId: "s1",
    mesaId: "m1",
    fecha: "2026-10-01",
    horaInicio: "12:00",
    numPersonas: 0,
  });
  assert.equal(parsed.success, false);
});

test("updateReservationSchema permite un payload parcial vacío", () => {
  assert.equal(updateReservationSchema.safeParse({}).success, true);
});

test("registerSchema exige contraseña de al menos 8 caracteres", () => {
  const corta = registerSchema.safeParse({
    nombre: "Ana Torres",
    email: "ana@example.com",
    password: "1234567",
    rol: "CLIENTE",
  });
  assert.equal(corta.success, false);

  const valida = registerSchema.safeParse({
    nombre: "Ana Torres",
    email: "ana@example.com",
    password: "12345678",
    rol: "CLIENTE",
  });
  assert.equal(valida.success, true);
});

test("createBranchSchema aplica 90 como duración por defecto de la reserva", () => {
  const parsed = createBranchSchema.parse({
    nombre: "Sucursal Sur",
    direccion: "Calle Falsa 123",
    horaApertura: "12:00",
    horaCierre: "22:00",
  });
  assert.equal(parsed.duracionReservaMin, 90);
});
