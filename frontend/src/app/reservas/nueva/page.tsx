"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { reservationsApi } from "@/lib/api";

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
      <h1 className="mb-6 text-xl font-semibold">Nueva reserva</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input
          placeholder="ID de sucursal"
          value={form.sucursalId}
          onChange={(e) => setForm({ ...form, sucursalId: e.target.value })}
          required
          className="rounded border px-3 py-2"
        />
        <input
          placeholder="ID de mesa"
          value={form.mesaId}
          onChange={(e) => setForm({ ...form, mesaId: e.target.value })}
          required
          className="rounded border px-3 py-2"
        />
        <input
          type="date"
          value={form.fecha}
          onChange={(e) => setForm({ ...form, fecha: e.target.value })}
          required
          className="rounded border px-3 py-2"
        />
        <input
          type="time"
          value={form.horaInicio}
          onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}
          required
          className="rounded border px-3 py-2"
        />
        <input
          type="number"
          min={1}
          placeholder="Número de personas"
          value={form.numPersonas}
          onChange={(e) => setForm({ ...form, numPersonas: Number(e.target.value) })}
          required
          className="rounded border px-3 py-2"
        />
        <textarea
          placeholder="Notas especiales (alergias, ocasión especial)"
          value={form.notasEspeciales}
          onChange={(e) => setForm({ ...form, notasEspeciales: e.target.value })}
          className="rounded border px-3 py-2"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={enviando}
          className="rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-black"
        >
          {enviando ? "Guardando..." : "Reservar"}
        </button>
      </form>
    </div>
  );
}
