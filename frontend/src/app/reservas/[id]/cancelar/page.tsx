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
    <div className="mx-auto max-w-sm">
      <div className="ticket flex flex-col items-center gap-6 p-10 text-center">
        <div className="stamp px-6 py-2 text-xl font-semibold uppercase">Anular</div>
        <p className="text-ink/70">
          ¿Confirmas que deseas cancelar esta reserva? Se enviará un correo de aviso al cliente.
        </p>
        {error && <p className="font-mono text-xs text-stamp">{error}</p>}
        <div className="flex gap-3">
          <button
            onClick={confirmarCancelacion}
            disabled={cancelando}
            className="rounded-sm bg-stamp px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-paper transition hover:opacity-90 disabled:opacity-50"
          >
            {cancelando ? "Anulando..." : "Sí, cancelar"}
          </button>
          <button
            onClick={() => router.back()}
            className="rounded-sm border border-ink/20 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-ink transition hover:border-ink/40"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}
