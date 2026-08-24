"use client";

import { useEffect, useState } from "react";
import { getSession } from "@/lib/session";
import { Usuario } from "@/lib/api";
import { mockUsuario } from "@/lib/mock";

export default function PerfilPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [esDemo, setEsDemo] = useState(false);

  useEffect(() => {
    const sesion = getSession();
    if (sesion) {
      setUsuario(sesion);
    } else {
      setUsuario(mockUsuario);
      setEsDemo(true);
    }
  }, []);

  if (!usuario) return null;

  const rolLegible: Record<Usuario["rol"], string> = {
    ADMIN: "Administrador de Cuenta",
    HOST: "Host / Encargado de Sucursal",
    CLIENTE: "Cliente Final",
  };

  return (
    <div className="mx-auto max-w-sm">
      <div className="ticket flex flex-col gap-1 p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink/50">
          Credencial{esDemo ? " · prototipo" : ""}
        </p>
        <h1 className="mt-1 font-display text-2xl italic text-ink">
          {usuario.nombre}
        </h1>
        <div className="ticket-perforation mt-5 pt-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink/50">
            Rol asignado
          </p>
          <p className="mt-1 inline-block rounded-sm bg-onyx px-3 py-1 font-mono text-xs text-paper">
            {rolLegible[usuario.rol]}
          </p>
        </div>
      </div>
    </div>
  );
}
