"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { reservationsApi } from "@/lib/api";

const inputClass =
  "rounded-sm border border-ink/15 bg-paper-dim px-3 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-line focus:outline-none";

export default function NuevaReservaPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    sucursalId: "",
    mesaId: "",
    fecha: "",
    horaInicio: "",
    numPersonas: 2,
    notasEspeciales: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await reservationsApi.create(form);
      router.push("/reservas");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <div className="ticket p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink/50">Nueva comanda</p>
        <h1 className="mt-2 font-display text-2xl italic text-ink">Reservar mesa</h1>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
          <input
            placeholder="ID de sucursal"
            value={form.sucursalId}
            onChange={(e) => setForm({ ...form, sucursalId: e.target.value })}
            required
            className={inputClass}
          />
          <input
            placeholder="ID de mesa"
            value={form.mesaId}
            onChange={(e) => setForm({ ...form, mesaId: e.target.value })}
            required
            className={inputClass}
          />
          <div className="flex gap-3">
            <input
              type="date"
              value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              required
              className={`${inputClass} flex-1`}
            />
            <input
              type="time"
              value={form.horaInicio}
              onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}
              required
              className={`${inputClass} flex-1`}
            />
          </div>
          <input
            type="number"
            min={1}
            placeholder="Número de personas"
            value={form.numPersonas}
            onChange={(e) => setForm({ ...form, numPersonas: Number(e.target.value) })}
            required
            className={inputClass}
          />
          <textarea
            placeholder="Notas especiales (alergias, ocasión especial)"
            value={form.notasEspeciales}
            onChange={(e) => setForm({ ...form, notasEspeciales: e.target.value })}
            className={inputClass}
          />
          {error && <p className="font-mono text-xs text-stamp">{error}</p>}
          <button
            type="submit"
            disabled={enviando}
            className="mt-2 rounded-sm bg-onyx px-4 py-2.5 font-mono text-xs uppercase tracking-widest text-paper transition hover:bg-onyx-deep disabled:opacity-50"
          >
            {enviando ? "Guardando..." : "Reservar"}
          </button>
        </form>
      </div>
    </div>
  );
}
