"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Reserva, reservationsApi } from "@/lib/api";

export default function ReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    reservationsApi
      .list()
      .then(setReservas)
      .catch((err) => setError((err as Error).message))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Mis reservas</h1>
        <Link href="/reservas/nueva" className="rounded bg-zinc-900 px-3 py-1.5 text-sm text-white dark:bg-zinc-100 dark:text-black">
          + Nueva reserva
        </Link>
      </div>

      {cargando && <p className="text-zinc-500">Cargando...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!cargando && !error && reservas.length === 0 && <p className="text-zinc-500">No tienes reservas aún.</p>}

      <ul className="flex flex-col gap-2">
        {reservas.map((r) => (
          <li key={r.id} className="flex items-center justify-between rounded border px-4 py-3">
            <div>
              <p className="font-medium">
                {r.fecha.slice(0, 10)} · {r.horaInicio} · {r.numPersonas} personas
              </p>
              <p className="text-sm text-zinc-500">Estado: {r.estado}</p>
            </div>
            <div className="flex gap-3 text-sm">
              <Link href={`/reservas/${r.id}/editar`} className="text-blue-600">
                Editar
              </Link>
              <Link href={`/reservas/${r.id}/cancelar`} className="text-red-600">
                Cancelar
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
