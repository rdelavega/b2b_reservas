import { test, expect, Page } from "@playwright/test";

/**
 * E2E: recorrido completo de un usuario CLIENTE contra el backend real.
 * Datos base provistos por `backend/prisma/seed.ts`.
 */

const CLIENTE = { email: "cliente@demo.test", password: "clave1234" };
const ADMIN = { email: "admin@demo.test", password: "clave1234" };

async function login(page: Page, cred: { email: string; password: string }) {
  await page.goto("/login");
  await page.getByPlaceholder("Correo electrónico").fill(cred.email);
  await page.getByPlaceholder("Contraseña").fill(cred.password);
  await page.getByRole("button", { name: "Ingresar" }).click();
  await page.waitForURL("**/reservas");
}

test("un cliente crea, edita y cancela una reserva desde la UI", async ({ page }) => {
  await login(page, CLIENTE);

  // Alta: elegir sucursal, ver disponibilidad y reservar un slot.
  await page.goto("/reservas/nueva");
  await page.getByRole("button", { name: "Ver disponibilidad" }).click();
  const primerSlot = page.locator("button", { hasText: /^\d{2}:\d{2}$/ }).first();
  await expect(primerSlot).toBeVisible();
  const hora = (await primerSlot.textContent())?.trim() ?? "";
  await primerSlot.click();
  await page.getByRole("button", { name: /Reservar mesa a las/ }).click();
  await page.waitForURL("**/reservas");

  // Lectura: la reserva aparece en el libro con su hora.
  const fila = page.locator("li.ticket", { hasText: hora }).first();
  await expect(fila).toBeVisible();
  await expect(fila).toContainText("PENDIENTE");

  // Cambio: editar el número de personas.
  await fila.getByRole("link", { name: "Editar" }).click();
  await page.waitForURL("**/editar");
  const inputPersonas = page.locator('input[type="number"]');
  await inputPersonas.fill("5");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await page.waitForURL("**/reservas");

  // Baja: cancelar la reserva.
  const filaEditada = page.locator("li.ticket", { hasText: hora }).first();
  await filaEditada.getByRole("link", { name: "Cancelar" }).click();
  await page.waitForURL("**/cancelar");
  await page.getByRole("button", { name: "Sí, cancelar" }).click();
  await page.waitForURL("**/reservas");

  await expect(
    page.locator("li.ticket", { hasText: hora }).first()
  ).toContainText("CANCELADA");
});

test("sin sesión, /reservas redirige a /login", async ({ page }) => {
  await page.goto("/reservas");
  await page.waitForURL("**/login");
  await expect(page.getByRole("heading", { name: "Iniciar sesión" })).toBeVisible();
});

test("un admin da de alta una sucursal y una mesa", async ({ page }) => {
  await login(page, ADMIN);
  await page.goto("/sucursales");

  const nombre = `Sucursal E2E ${Date.now()}`;
  await page.getByPlaceholder("Nombre").fill(nombre);
  await page.getByPlaceholder("Dirección").fill("Calle de prueba 456, Colonia Centro");
  await page.getByRole("button", { name: "Crear sucursal" }).click();

  const enlace = page.getByRole("link", { name: new RegExp(nombre) });
  await expect(enlace).toBeVisible();
  await enlace.click();
  await page.waitForURL("**/sucursales/**");

  await page.getByRole("button", { name: "Agregar" }).click();
  await expect(page.getByText(/Mesa 1 · /)).toBeVisible();

  // Limpieza: eliminar la sucursal creada por la prueba.
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Eliminar" }).click();
  await page.waitForURL("**/sucursales");
  await expect(page.getByRole("link", { name: new RegExp(nombre) })).toHaveCount(0);
});
