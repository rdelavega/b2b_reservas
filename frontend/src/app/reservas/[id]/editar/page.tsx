"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Reserva, reservationsApi } from "@/lib/api";

export default function EditarReservaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    reservationsApi.getOne(id).then(setReserva).catch((err) => setError((err as Error).message));
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

  if (!reserva) return <p className="text-zinc-500">{error ?? "Cargando..."}</p>;

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-xl font-semibold">Editar reserva</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input
          type="date"
          value={reserva.fecha.slice(0, 10)}
          onChange={(e) => setReserva({ ...reserva, fecha: e.target.value })}
          className="rounded border px-3 py-2"
        />
        <input
          type="time"
          value={reserva.horaInicio}
          onChange={(e) => setReserva({ ...reserva, horaInicio: e.target.value })}
          className="rounded border px-3 py-2"
        />
        <input
          type="number"
          min={1}
          value={reserva.numPersonas}
          onChange={(e) => setReserva({ ...reserva, numPersonas: Number(e.target.value) })}
          className="rounded border px-3 py-2"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={guardando}
          className="rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-black"
        >
          {guardando ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
