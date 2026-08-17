"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearSession, getSession } from "@/lib/session";
import { Usuario } from "@/lib/api";

export default function NavBar() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    setUsuario(getSession());
  }, []);

  return (
    <nav className="flex items-center justify-between border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
      <Link href="/" className="font-semibold">
        Reservas B2B
      </Link>
      <div className="flex items-center gap-4 text-sm">
        <Link href="/reservas">Mis reservas</Link>
        <Link href="/reservas/nueva">Nueva reserva</Link>
        <Link href="/perfil">Perfil</Link>
        {usuario ? (
          <button
            onClick={() => {
              clearSession();
              window.location.href = "/login";
            }}
            className="text-red-600"
          >
            Salir
          </button>
        ) : (
          <Link href="/login">Iniciar sesión</Link>
        )}
      </div>
    </nav>
  );
}
