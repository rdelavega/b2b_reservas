import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { clearSession, saveSession } from "@/lib/session";
import NavBar from "./NavBar";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("NavBar", () => {
  beforeEach(() => {
    clearSession();
  });
  afterEach(() => {
    clearSession();
  });

  test("sin sesión, sólo muestra el enlace de Ingresar (y el logo)", () => {
    render(<NavBar />);
    expect(screen.getByRole("link", { name: "Ingresar" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Sucursales" })).not.toBeInTheDocument();
    // "Reservas" sólo debería aparecer una vez: el logo, no el enlace de navegación.
    expect(screen.getAllByRole("link", { name: "Reservas" })).toHaveLength(1);
  });

  test("con sesión CLIENTE, muestra sus enlaces pero no Sucursales", () => {
    saveSession("token-demo", { id: "u1", nombre: "Ana Torres", rol: "CLIENTE" });
    render(<NavBar />);
    // Ahora "Reservas" aparece dos veces: el logo y el enlace de navegación.
    expect(screen.getAllByRole("link", { name: "Reservas" })).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Perfil" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Sucursales" })).not.toBeInTheDocument();
    expect(screen.getByText("Ana · Cliente")).toBeInTheDocument();
  });

  test("con sesión ADMIN, sí muestra el enlace de Sucursales", () => {
    saveSession("token-demo", { id: "u2", nombre: "Root Admin", rol: "ADMIN" });
    render(<NavBar />);
    expect(screen.getByRole("link", { name: "Sucursales" })).toBeInTheDocument();
  });
});
