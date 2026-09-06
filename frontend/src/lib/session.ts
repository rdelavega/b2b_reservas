import { Rol, Usuario } from "./api";

export type Sesion = { token: string | null; usuario: Usuario | null };

const VACIA: Sesion = { token: null, usuario: null };

let snapshot: Sesion = VACIA;
const listeners = new Set<() => void>();

function leer(): Sesion {
  if (typeof window === "undefined") return VACIA;
  const token = localStorage.getItem("token");
  const raw = localStorage.getItem("usuario");
  let usuario: Usuario | null = null;
  if (raw) {
    try {
      usuario = JSON.parse(raw) as Usuario;
    } catch {
      usuario = null;
    }
  }
  return { token, usuario };
}

function refrescar() {
  snapshot = leer();
  listeners.forEach((l) => l());
}

// Sincroniza el snapshot inicial una vez en el cliente.
if (typeof window !== "undefined") {
  snapshot = leer();
  window.addEventListener("storage", (e) => {
    if (e.key === "token" || e.key === "usuario" || e.key === null) refrescar();
  });
}

/** API para useSyncExternalStore. */
export function subscribeSession(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSessionSnapshot(): Sesion {
  return snapshot;
}

export function getServerSessionSnapshot(): Sesion {
  return VACIA;
}

export function saveSession(token: string, usuario: Usuario) {
  localStorage.setItem("token", token);
  localStorage.setItem("usuario", JSON.stringify(usuario));
  refrescar();
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  refrescar();
}

/** Lectura puntual fuera de React (p. ej. en el cliente HTTP). */
export function getToken(): string | null {
  return leer().token;
}

export function getSession(): Usuario | null {
  return leer().usuario;
}

export function tieneRol(usuario: Usuario | null, roles: Rol[]): boolean {
  return !!usuario && roles.includes(usuario.rol);
}
