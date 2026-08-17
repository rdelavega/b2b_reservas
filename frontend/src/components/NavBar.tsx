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
    <nav className="border-b border-line/30 bg-onyx-deep/60">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-xl italic text-paper">
          Reservas B2B
        </Link>
        <div className="flex items-center gap-5 font-mono text-xs uppercase tracking-widest text-paper/70">
          <Link href="/reservas" className="transition hover:text-line-bright">
            Reservas
          </Link>
          <Link href="/reservas/nueva" className="transition hover:text-line-bright">
            Nueva
          </Link>
          <Link href="/perfil" className="transition hover:text-line-bright">
            Perfil
          </Link>
          {usuario ? (
            <button
              onClick={() => {
                clearSession();
                window.location.href = "/login";
              }}
              className="text-stamp transition hover:text-line-bright"
            >
              Salir
            </button>
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
