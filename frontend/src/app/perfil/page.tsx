"use client";

import { useEffect, useState } from "react";
import { authApi, Perfil } from "@/lib/api";
import { useSession } from "@/lib/useSession";

const inputClass =
  "rounded-sm border border-ink/15 bg-paper-dim px-3 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-line focus:outline-none";

const ROL_LEGIBLE: Record<Perfil["rol"], string> = {
  ADMIN: "Administrador de Cuenta",
  HOST: "Host / Encargado de Sucursal",
  CLIENTE: "Cliente Final",
};

export default function PerfilPage() {
  const { cargando: cargandoSesion, estado } = useSession();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [errorPerfil, setErrorPerfil] = useState<string | null>(null);

  const [pass, setPass] = useState({ actual: "", nueva: "" });
  const [msg, setMsg] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (estado !== "autenticado") return;
    authApi
      .me()
      .then(setPerfil)
      .catch((err) => setErrorPerfil((err as Error).message));
  }, [estado]);

  async function cambiarPassword(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setGuardando(true);
    try {
      await authApi.changePassword(pass.actual, pass.nueva);
      setMsg({ tipo: "ok", texto: "Contraseña actualizada." });
      setPass({ actual: "", nueva: "" });
    } catch (err) {
      setMsg({ tipo: "error", texto: (err as Error).message });
    } finally {
      setGuardando(false);
    }
  }

  if (cargandoSesion || estado !== "autenticado") {
    return <p className="font-mono text-sm text-paper/50">Cargando...</p>;
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6">
      <div className="ticket flex flex-col gap-1 p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink/50">Credencial</p>
        {errorPerfil && <p className="font-mono text-xs text-stamp">{errorPerfil}</p>}
        {!perfil && !errorPerfil && (
          <p className="font-mono text-sm text-ink/50">Cargando perfil...</p>
        )}
        {perfil && (
          <>
            <h1 className="mt-1 font-display text-2xl italic text-ink">{perfil.nombre}</h1>
            <p className="font-mono text-xs text-ink/60">{perfil.email}</p>
            <div className="ticket-perforation mt-5 pt-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink/50">
                Rol asignado
              </p>
              <p className="mt-1 inline-block rounded-sm bg-onyx px-3 py-1 font-mono text-xs text-paper">
                {ROL_LEGIBLE[perfil.rol]}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="ticket p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink/50">Seguridad</p>
        <h2 className="mt-2 font-display text-xl italic text-ink">Cambiar contraseña</h2>
        <form onSubmit={cambiarPassword} className="mt-4 flex flex-col gap-3">
          <input
            type="password"
            placeholder="Contraseña actual"
            value={pass.actual}
            onChange={(e) => setPass({ ...pass, actual: e.target.value })}
            required
            className={inputClass}
          />
          <input
            type="password"
            placeholder="Nueva contraseña (mín. 8)"
            value={pass.nueva}
            onChange={(e) => setPass({ ...pass, nueva: e.target.value })}
            required
            minLength={8}
            className={inputClass}
          />
          {msg && (
            <p className={`font-mono text-xs ${msg.tipo === "ok" ? "text-onyx" : "text-stamp"}`}>
              {msg.texto}
            </p>
          )}
          <button
            type="submit"
            disabled={guardando}
            className="mt-1 rounded-sm bg-onyx px-4 py-2.5 font-mono text-xs uppercase tracking-widest text-paper transition hover:bg-onyx-deep disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Actualizar"}
          </button>
        </form>
      </div>
    </div>
  );
}
