"use client";

import { useEffect, useState } from "react";
import { getSession } from "@/lib/session";
import { Usuario } from "@/lib/api";

export default function PerfilPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    setUsuario(getSession());
  }, []);

  if (!usuario) {
    return <p className="text-zinc-600 dark:text-zinc-400">Inicia sesión para ver tu perfil.</p>;
  }

  const rolLegible: Record<Usuario["rol"], string> = {
    ADMIN: "Administrador de Cuenta",
    HOST: "Host / Encargado de Sucursal",
    CLIENTE: "Cliente Final",
  };

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-xl font-semibold">Mi perfil</h1>
      <p>
        <span className="text-zinc-500">Nombre:</span> {usuario.nombre}
      </p>
      <p>
        <span className="text-zinc-500">Rol:</span> {rolLegible[usuario.rol]}
      </p>
    </div>
  );
}
