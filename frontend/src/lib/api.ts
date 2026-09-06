const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type Rol = "ADMIN" | "HOST" | "CLIENTE";

export type Usuario = { id: string; nombre: string; rol: Rol };

export type Perfil = Usuario & { email: string; sucursalId: string | null };

export type EstadoReserva = "PENDIENTE" | "CONFIRMADA" | "CANCELADA" | "COMPLETADA";

export type Mesa = { id: string; numero: number; capacidad: number };

export type Sucursal = {
  id: string;
  nombre: string;
  direccion: string;
  horaApertura: string;
  horaCierre: string;
  duracionReservaMin: number;
  mesas?: Mesa[];
};

export type Disponibilidad = {
  mesaId: string;
  numero: number;
  capacidad: number;
  slotsLibres: string[];
};

export type Reserva = {
  id: string;
  sucursalId: string;
  mesaId: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  numPersonas: number;
  estado: EstadoReserva;
  notasEspeciales?: string | null;
  sucursal?: { id: string; nombre: string; direccion: string };
  mesa?: { id: string; numero: number; capacidad: number };
};

/** Error con el status HTTP para que las vistas puedan distinguir 401/403/409. */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function mensajeDeError(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "error" in body) {
    const e = (body as { error: unknown }).error;
    if (typeof e === "string") return e;
    // Zod flatten: { formErrors, fieldErrors }
    if (e && typeof e === "object") {
      const fieldErrors = (e as { fieldErrors?: Record<string, string[]> }).fieldErrors;
      if (fieldErrors) {
        const primero = Object.entries(fieldErrors)[0];
        if (primero) return `${primero[0]}: ${primero[1]?.[0] ?? "dato inválido"}`;
      }
    }
  }
  return fallback;
}

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

  if (res.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    if (!window.location.pathname.startsWith("/login")) {
      // Redirección forzada desde el cliente HTTP (fuera del árbol de React,
      // sin acceso a useRouter): un reload completo limpia todo el estado.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/login?expirada=1");
    }
    throw new ApiError("Sesión expirada. Vuelve a iniciar sesión.", 401);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(mensajeDeError(body, res.statusText || "Error en la solicitud"), res.status);
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
  register: (data: { nombre: string; email: string; password: string; rol: Rol; sucursalId?: string }) =>
    request<Usuario>("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  me: () => request<Perfil>("/auth/me"),
  changePassword: (passwordActual: string, passwordNueva: string) =>
    request<void>("/auth/password", {
      method: "PATCH",
      body: JSON.stringify({ passwordActual, passwordNueva }),
    }),
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
  update: (
    id: string,
    data: Partial<{ fecha: string; horaInicio: string; numPersonas: number; notasEspeciales: string }>
  ) => request<Reserva>(`/reservations/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  confirm: (id: string) =>
    request<Reserva>(`/reservations/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ estado: "CONFIRMADA" }),
    }),
  cancel: (id: string) => request<Reserva>(`/reservations/${id}`, { method: "DELETE" }),
};

export const branchesApi = {
  list: () => request<Sucursal[]>("/branches"),
  getOne: (id: string) => request<Sucursal>(`/branches/${id}`),
  availability: (id: string, fecha: string, personas: number) =>
    request<Disponibilidad[]>(
      `/branches/${id}/availability?fecha=${fecha}&personas=${personas}`
    ),
  create: (data: {
    nombre: string;
    direccion: string;
    horaApertura: string;
    horaCierre: string;
    duracionReservaMin?: number;
  }) => request<Sucursal>("/branches", { method: "POST", body: JSON.stringify(data) }),
  update: (
    id: string,
    data: Partial<{
      nombre: string;
      direccion: string;
      horaApertura: string;
      horaCierre: string;
      duracionReservaMin: number;
    }>
  ) => request<Sucursal>(`/branches/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: string) => request<void>(`/branches/${id}`, { method: "DELETE" }),
  addMesa: (sucursalId: string, numero: number, capacidad: number) =>
    request<Mesa>(`/branches/${sucursalId}/mesas`, {
      method: "POST",
      body: JSON.stringify({ numero, capacidad }),
    }),
  removeMesa: (sucursalId: string, mesaId: string) =>
    request<void>(`/branches/${sucursalId}/mesas/${mesaId}`, { method: "DELETE" }),
};
