"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Reserva, reservationsApi } from "@/lib/api";
import { useSession } from "@/lib/useSession";

const ESTADO_COLOR: Record<Reserva["estado"], string> = {
  PENDIENTE: "text-line",
  CONFIRMADA: "text-onyx",
  CANCELADA: "text-stamp",
  COMPLETADA: "text-ink/50",
};

export default function ReservasPage() {
  const { usuario, estado: estadoSesion } = useSession();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [accionando, setAccionando] = useState<string | null>(null);

  const cargar = useCallback(() => {
    reservationsApi
      .list()
      .then(setReservas)
      .catch((err) => setError((err as Error).message))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    if (estadoSesion === "autenticado") cargar();
  }, [estadoSesion, cargar]);

  async function confirmar(id: string) {
    setAccionando(id);
    try {
      await reservationsApi.confirm(id);
      cargar();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAccionando(null);
    }
  }

  const puedeConfirmar = usuario?.rol === "HOST" || usuario?.rol === "ADMIN";

  if (estadoSesion !== "autenticado") {
    return <p className="font-mono text-sm text-paper/50">Cargando...</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-line">Libro de reservas</p>
          <h1 className="mt-1 font-display text-2xl italic text-paper">Mis reservas</h1>
        </div>
        <Link
          href="/reservas/nueva"
          className="rounded-sm bg-line px-4 py-2 font-mono text-xs uppercase tracking-widest text-onyx-deep transition hover:bg-line-bright"
        >
          + Nueva
        </Link>
      </div>

      {cargando && <p className="font-mono text-sm text-paper/50">Cargando...</p>}
      {error && <p className="font-mono text-sm text-stamp">{error}</p>}
      {!cargando && !error && reservas.length === 0 && (
        <p className="font-mono text-sm text-paper/50">Aún no hay comandas en el libro.</p>
      )}

      <ul className="flex flex-col gap-5">
        {reservas.map((r) => (
          <li key={r.id} className="ticket flex overflow-hidden">
            <div className="flex w-28 shrink-0 flex-col items-center justify-center gap-1 border-r-2 border-dashed border-ink/20 bg-paper-dim py-4 font-mono">
              <span className="text-[10px] uppercase tracking-widest text-ink/40">
                {r.fecha.slice(5, 10)}
              </span>
              <span className="text-lg font-semibold text-ink">{r.horaInicio}</span>
              <span className="text-[10px] uppercase tracking-widest text-ink/40">
                {r.numPersonas} pax
              </span>
            </div>
            <div className="flex flex-1 flex-col justify-center gap-2 px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p
                    className={`font-mono text-[10px] uppercase tracking-widest ${ESTADO_COLOR[r.estado]}`}
                  >
                    {r.estado}
                  </p>
                  <p className="mt-1 font-display text-lg italic text-ink">
                    {r.sucursal?.nombre ?? "Sucursal"} · Mesa {r.mesa?.numero ?? "?"}
                  </p>
                  {r.notasEspeciales && (
                    <p className="mt-0.5 font-mono text-xs text-ink/50">{r.notasEspeciales}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-4 font-mono text-xs uppercase tracking-widest">
                {puedeConfirmar && r.estado === "PENDIENTE" && (
                  <button
                    onClick={() => confirmar(r.id)}
                    disabled={accionando === r.id}
                    className="text-onyx transition hover:text-line disabled:opacity-50"
                  >
                    {accionando === r.id ? "..." : "Confirmar"}
                  </button>
                )}
                {r.estado !== "CANCELADA" && (
                  <>
                    <Link
                      href={`/reservas/${r.id}/editar`}
                      className="text-onyx transition hover:text-line"
                    >
                      Editar
                    </Link>
                    <Link
                      href={`/reservas/${r.id}/cancelar`}
                      className="text-stamp transition hover:text-line"
                    >
                      Cancelar
                    </Link>
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
