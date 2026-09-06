"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Rol } from "./api";
import {
  getServerSessionSnapshot,
  getSessionSnapshot,
  subscribeSession,
} from "./session";

type Estado = "cargando" | "autenticado" | "anonimo";

/**
 * Hook de sesión para páginas cliente.
 * Lee la sesión de localStorage vía useSyncExternalStore y aplica las
 * redirecciones de guardas en un efecto (nunca setState síncrono en efecto).
 *
 * @param opts.rolesPermitidos si se indica, redirige a /reservas cuando el rol no coincide.
 * @param opts.opcional si es true, no redirige a /login cuando no hay sesión.
 */
export function useSession(opts: { rolesPermitidos?: Rol[]; opcional?: boolean } = {}) {
  const router = useRouter();
  const sesion = useSyncExternalStore(
    subscribeSession,
    getSessionSnapshot,
    getServerSessionSnapshot
  );

  const hidratado = useHidratado();
  const usuario = sesion.usuario;

  let estado: Estado = "cargando";
  if (hidratado) {
    estado = sesion.token && usuario ? "autenticado" : "anonimo";
  }

  const rolInvalido =
    estado === "autenticado" &&
    !!opts.rolesPermitidos &&
    !opts.rolesPermitidos.includes(usuario!.rol);

  useEffect(() => {
    if (!hidratado) return;
    if (estado === "anonimo" && !opts.opcional) {
      router.replace("/login");
    } else if (rolInvalido) {
      router.replace("/reservas");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hidratado, estado, rolInvalido]);

  return { usuario, estado: rolInvalido ? ("cargando" as Estado) : estado, cargando: estado === "cargando" };
}

/** true una vez montado en el cliente (evita desajustes de hidratación). */
function useHidratado() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}
