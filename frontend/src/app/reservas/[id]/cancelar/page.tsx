"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { reservationsApi } from "@/lib/api";

export default function CancelarReservaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [cancelando, setCancelando] = useState(false);

  async function confirmarCancelacion() {
    setError(null);
    setCancelando(true);
    try {
      await reservationsApi.cancel(id);
      router.push("/reservas");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCancelando(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Cancelar reserva</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        ¿Confirmas que deseas cancelar esta reserva? Se enviará un correo de aviso.
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button
          onClick={confirmarCancelacion}
          disabled={cancelando}
          className="rounded bg-red-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {cancelando ? "Cancelando..." : "Sí, cancelar"}
        </button>
        <button onClick={() => router.back()} className="rounded border px-4 py-2">
          Volver
        </button>
      </div>
    </div>
  );
}
