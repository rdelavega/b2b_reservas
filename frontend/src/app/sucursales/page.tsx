"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { branchesApi, Sucursal } from "@/lib/api";
import { useSession } from "@/lib/useSession";

const inputClass =
  "rounded-sm border border-ink/15 bg-paper-dim px-3 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-line focus:outline-none";

const FORM_INICIAL = {
  nombre: "",
  direccion: "",
  horaApertura: "12:00",
  horaCierre: "23:00",
  duracionReservaMin: 90,
};

export default function SucursalesPage() {
  const { estado: estadoSesion } = useSession({ rolesPermitidos: ["ADMIN"] });
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState(FORM_INICIAL);
  const [creando, setCreando] = useState(false);

  const cargar = useCallback(() => {
    branchesApi
      .list()
      .then(setSucursales)
      .catch((err) => setError((err as Error).message))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    if (estadoSesion === "autenticado") cargar();
  }, [estadoSesion, cargar]);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreando(true);
    try {
      await branchesApi.create(form);
      setForm(FORM_INICIAL);
      cargar();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreando(false);
    }
  }

  if (estadoSesion !== "autenticado") {
    return <p className="font-mono text-sm text-paper/50">Cargando...</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-line">Administración</p>
        <h1 className="mt-1 font-display text-2xl italic text-paper">Sucursales</h1>
      </div>

      {error && <p className="font-mono text-sm text-stamp">{error}</p>}
      {cargando && <p className="font-mono text-sm text-paper/50">Cargando...</p>}

      <ul className="flex flex-col gap-3">
        {sucursales.map((s) => (
          <li key={s.id}>
            <Link href={`/sucursales/${s.id}`} className="ticket flex items-center justify-between p-5">
              <div>
                <p className="font-display text-lg italic text-ink">{s.nombre}</p>
                <p className="font-mono text-xs text-ink/50">{s.direccion}</p>
              </div>
              <p className="font-mono text-xs text-ink/50">
                {s.mesas?.length ?? 0} mesas · {s.horaApertura}–{s.horaCierre}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <form onSubmit={crear} className="ticket flex flex-col gap-3 p-6">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50">Nueva sucursal</p>
        <input
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          required
          minLength={2}
          className={inputClass}
        />
        <input
          placeholder="Dirección"
          value={form.direccion}
          onChange={(e) => setForm({ ...form, direccion: e.target.value })}
          required
          minLength={5}
          className={inputClass}
        />
        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-1">
            <label className="font-mono text-[10px] uppercase tracking-widest text-ink/50">Apertura</label>
            <input
              type="time"
              value={form.horaApertura}
              onChange={(e) => setForm({ ...form, horaApertura: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label className="font-mono text-[10px] uppercase tracking-widest text-ink/50">Cierre</label>
            <input
              type="time"
              value={form.horaCierre}
              onChange={(e) => setForm({ ...form, horaCierre: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label className="font-mono text-[10px] uppercase tracking-widest text-ink/50">Min/reserva</label>
            <input
              type="number"
              min={30}
              step={15}
              value={form.duracionReservaMin}
              onChange={(e) => setForm({ ...form, duracionReservaMin: Number(e.target.value) })}
              className={inputClass}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={creando}
          className="mt-1 rounded-sm bg-onyx px-4 py-2.5 font-mono text-xs uppercase tracking-widest text-paper transition hover:bg-onyx-deep disabled:opacity-50"
        >
          {creando ? "Creando..." : "Crear sucursal"}
        </button>
      </form>
    </div>
  );
}
