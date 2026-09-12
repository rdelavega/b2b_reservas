import { test } from "node:test";
import assert from "node:assert/strict";
import { horaDesdeMinutos, minutosDesde, sumarMinutos } from "../../lib/time";

test("minutosDesde convierte HH:MM a minutos desde medianoche", () => {
  assert.equal(minutosDesde("00:00"), 0);
  assert.equal(minutosDesde("01:30"), 90);
  assert.equal(minutosDesde("23:59"), 1439);
});

test("horaDesdeMinutos convierte minutos a HH:MM con ceros a la izquierda", () => {
  assert.equal(horaDesdeMinutos(0), "00:00");
  assert.equal(horaDesdeMinutos(90), "01:30");
  assert.equal(horaDesdeMinutos(605), "10:05");
});

test("sumarMinutos calcula la hora de fin de una reserva", () => {
  assert.equal(sumarMinutos("12:00", 90), "13:30");
  assert.equal(sumarMinutos("23:00", 90), "24:30"); // sin recorte de día; documentado por diseño
});
