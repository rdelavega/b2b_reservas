import { afterEach, describe, expect, test, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { clearSession } from "@/lib/session";
import { authApi } from "@/lib/api";
import LoginPage from "./page";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/api", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/lib/api")>();
  return { ...mod, authApi: { ...mod.authApi, login: vi.fn() } };
});

describe("LoginPage", () => {
  afterEach(() => {
    clearSession();
    vi.clearAllMocks();
  });

  test("credenciales inválidas: muestra el error del backend y no navega", async () => {
    vi.mocked(authApi.login).mockRejectedValueOnce(new Error("Credenciales inválidas"));
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText("Correo electrónico"), "ana@example.com");
    await user.type(screen.getByPlaceholderText("Contraseña"), "clave-incorrecta");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(await screen.findByText("Credenciales inválidas")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  test("login correcto: guarda la sesión y navega a /reservas", async () => {
    vi.mocked(authApi.login).mockResolvedValueOnce({
      token: "token-demo",
      usuario: { id: "u1", nombre: "Ana Torres", rol: "CLIENTE" },
    });
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText("Correo electrónico"), "ana@example.com");
    await user.type(screen.getByPlaceholderText("Contraseña"), "clave1234");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/reservas"));
  });
});
