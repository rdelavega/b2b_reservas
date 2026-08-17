import { Usuario } from "./api";

export function saveSession(token: string, usuario: Usuario) {
  localStorage.setItem("token", token);
  localStorage.setItem("usuario", JSON.stringify(usuario));
}

export function getSession(): Usuario | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("usuario");
  return raw ? (JSON.parse(raw) as Usuario) : null;
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
}
