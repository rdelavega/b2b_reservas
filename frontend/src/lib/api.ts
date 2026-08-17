const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type Rol = "ADMIN" | "HOST" | "CLIENTE";

export type Usuario = { id: string; nombre: string; rol: Rol };

export type Reserva = {
  id: string;
  sucursalId: string;
  mesaId: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  numPersonas: number;
  estado: "PENDIENTE" | "CONFIRMADA" | "CANCELADA" | "COMPLETADA";
  notasEspeciales?: string | null;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? "Error en la solicitud");
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; usuario: Usuario }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (data: { nombre: string; email: string; password: string; rol: Rol }) =>
    request<Usuario>("/auth/register", { method: "POST", body: JSON.stringify(data) }),
};

export const reservationsApi = {
  list: () => request<Reserva[]>("/reservations"),
  getOne: (id: string) => request<Reserva>(`/reservations/${id}`),
  create: (data: {
    sucursalId: string;
    mesaId: string;
    fecha: string;
    horaInicio: string;
    numPersonas: number;
    notasEspeciales?: string;
  }) => request<Reserva>("/reservations", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<{ fecha: string; horaInicio: string; numPersonas: number; notasEspeciales: string }>) =>
    request<Reserva>(`/reservations/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  cancel: (id: string) => request<Reserva>(`/reservations/${id}`, { method: "DELETE" }),
};

export const branchesApi = {
  list: () => request<Array<{ id: string; nombre: string; direccion: string }>>("/branches"),
};
