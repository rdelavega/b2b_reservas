"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Reserva, reservationsApi } from "@/lib/api";
import { mockReservas } from "@/lib/mock";

const inputClass =
  "rounded-sm border border-ink/15 bg-paper-dim px-3 py-2.5 text-sm text-ink focus:border-line focus:outline-none";

export default function EditarReservaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    reservationsApi
      .getOne(id)
      .then(setReserva)
      .catch(() => setReserva(mockReservas[0]));
  }, [id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reserva) return;
    setError(null);
    setGuardando(true);
    try {
      await reservationsApi.update(id, {
        fecha: reserva.fecha.slice(0, 10),
        horaInicio: reserva.horaInicio,
        numPersonas: reserva.numPersonas,
        notasEspeciales: reserva.notasEspeciales ?? undefined,
      });
      router.push("/reservas");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGuardando(false);
    }
  }

  if (!reserva) return <p className="font-mono text-sm text-paper/50">Cargando...</p>;

  return (
    <div className="mx-auto max-w-sm">
      <div className="ticket p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink/50">Corregir comanda</p>
        <h1 className="mt-2 font-display text-2xl italic text-ink">Editar reserva</h1>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
          <input
            type="date"
            value={reserva.fecha.slice(0, 10)}
            onChange={(e) => setReserva({ ...reserva, fecha: e.target.value })}
            className={inputClass}
          />
          <input
            type="time"
            value={reserva.horaInicio}
            onChange={(e) => setReserva({ ...reserva, horaInicio: e.target.value })}
            className={inputClass}
          />
          <input
            type="number"
            min={1}
            value={reserva.numPersonas}
            onChange={(e) => setReserva({ ...reserva, numPersonas: Number(e.target.value) })}
            className={inputClass}
          />
          {error && <p className="font-mono text-xs text-stamp">{error}</p>}
          <button
            type="submit"
            disabled={guardando}
            className="mt-2 rounded-sm bg-onyx px-4 py-2.5 font-mono text-xs uppercase tracking-widest text-paper transition hover:bg-onyx-deep disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </div>
    </div>
  );
}
