"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import {
  clearSession,
  getServerSessionSnapshot,
  getSessionSnapshot,
  subscribeSession,
} from "@/lib/session";
import { Usuario } from "@/lib/api";

const ROL_LEGIBLE: Record<Usuario["rol"], string> = {
  ADMIN: "Admin",
  HOST: "Host",
  CLIENTE: "Cliente",
};

export default function NavBar() {
  const router = useRouter();
  const { usuario } = useSyncExternalStore(
    subscribeSession,
    getSessionSnapshot,
    getServerSessionSnapshot
  );

  const enlaces: Array<{ href: string; label: string }> = usuario
    ? [
        { href: "/reservas", label: "Reservas" },
        { href: "/reservas/nueva", label: "Nueva" },
        ...(usuario.rol === "ADMIN" ? [{ href: "/sucursales", label: "Sucursales" }] : []),
        { href: "/perfil", label: "Perfil" },
      ]
    : [];

  function salir() {
    clearSession();
    router.push("/login");
  }

  return (
    <nav className="border-b border-line/30 bg-onyx-deep/60">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-xl text-paper">
          Reservas
        </Link>
        <div className="flex items-center gap-5 font-mono text-xs uppercase tracking-widest text-paper/70">
          {enlaces.map((e) => (
            <Link key={e.href} href={e.href} className="transition hover:text-line-bright">
              {e.label}
            </Link>
          ))}
          {usuario ? (
            <>
              <span className="hidden text-line/70 sm:inline">
                {usuario.nombre.split(" ")[0]} · {ROL_LEGIBLE[usuario.rol]}
              </span>
              <button
                onClick={salir}
                className="text-stamp transition hover:text-line-bright"
              >
                Salir
              </button>
            </>
          ) : (
            <Link href="/login" className="text-line transition hover:text-line-bright">
              Ingresar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
