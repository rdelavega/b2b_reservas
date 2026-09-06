"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { branchesApi, Sucursal } from "@/lib/api";
import { useSession } from "@/lib/useSession";

const inputClass =
  "rounded-sm border border-ink/15 bg-paper-dim px-3 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-line focus:outline-none";

export default function SucursalDetallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { estado: estadoSesion } = useSession({ rolesPermitidos: ["ADMIN"] });

  const [sucursal, setSucursal] = useState<Sucursal | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [mesaForm, setMesaForm] = useState({ numero: 1, capacidad: 4 });
  const [agregandoMesa, setAgregandoMesa] = useState(false);

  const cargar = useCallback(() => {
    branchesApi
      .getOne(id)
      .then((s) => {
        setSucursal(s);
        setMesaForm({ numero: (s.mesas?.length ?? 0) + 1, capacidad: 4 });
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setCargando(false));
  }, [id]);

  useEffect(() => {
    if (estadoSesion === "autenticado") cargar();
  }, [estadoSesion, cargar]);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!sucursal) return;
    setError(null);
    setGuardando(true);
    try {
      await branchesApi.update(id, {
        nombre: sucursal.nombre,
        direccion: sucursal.direccion,
        horaApertura: sucursal.horaApertura,
        horaCierre: sucursal.horaCierre,
        duracionReservaMin: sucursal.duracionReservaMin,
      });
      cargar();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar() {
    if (!confirm("¿Eliminar esta sucursal? No se puede deshacer.")) return;
    setError(null);
    try {
      await branchesApi.remove(id);
      router.push("/sucursales");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function agregarMesa(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setAgregandoMesa(true);
    try {
      await branchesApi.addMesa(id, mesaForm.numero, mesaForm.capacidad);
      cargar();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAgregandoMesa(false);
    }
  }

  async function quitarMesa(mesaId: string) {
    setError(null);
    try {
      await branchesApi.removeMesa(id, mesaId);
      cargar();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (estadoSesion !== "autenticado" || cargando) {
    return <p className="font-mono text-sm text-paper/50">Cargando...</p>;
  }
  if (!sucursal) {
    return <p className="font-mono text-sm text-stamp">{error ?? "Sucursal no encontrada."}</p>;
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <form onSubmit={guardar} className="ticket flex flex-col gap-3 p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink/50">Datos de sucursal</p>
        <input
          value={sucursal.nombre}
          onChange={(e) => setSucursal({ ...sucursal, nombre: e.target.value })}
          className={inputClass}
        />
        <input
          value={sucursal.direccion}
          onChange={(e) => setSucursal({ ...sucursal, direccion: e.target.value })}
          className={inputClass}
        />
        <div className="flex gap-3">
          <input
            type="time"
            value={sucursal.horaApertura}
            onChange={(e) => setSucursal({ ...sucursal, horaApertura: e.target.value })}
            className={`${inputClass} flex-1`}
          />
          <input
            type="time"
            value={sucursal.horaCierre}
            onChange={(e) => setSucursal({ ...sucursal, horaCierre: e.target.value })}
            className={`${inputClass} flex-1`}
          />
          <input
            type="number"
            min={30}
            step={15}
            value={sucursal.duracionReservaMin}
            onChange={(e) =>
              setSucursal({ ...sucursal, duracionReservaMin: Number(e.target.value) })
            }
            className={`${inputClass} flex-1`}
          />
        </div>
        {error && <p className="font-mono text-xs text-stamp">{error}</p>}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={guardando}
            className="flex-1 rounded-sm bg-onyx px-4 py-2.5 font-mono text-xs uppercase tracking-widest text-paper transition hover:bg-onyx-deep disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Guardar"}
          </button>
          <button
            type="button"
            onClick={eliminar}
            className="rounded-sm border border-stamp px-4 py-2.5 font-mono text-xs uppercase tracking-widest text-stamp transition hover:bg-stamp hover:text-paper"
          >
            Eliminar
          </button>
        </div>
      </form>

      <div className="ticket flex flex-col gap-3 p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink/50">
          Mesas ({sucursal.mesas?.length ?? 0})
        </p>
        <ul className="flex flex-col gap-2">
          {(sucursal.mesas ?? [])
            .slice()
            .sort((a, b) => a.numero - b.numero)
            .map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between border-b border-ink/10 pb-2 font-mono text-sm text-ink"
              >
                <span>
                  Mesa {m.numero} · {m.capacidad} pax
                </span>
                <button
                  onClick={() => quitarMesa(m.id)}
                  className="text-xs uppercase tracking-widest text-stamp transition hover:opacity-70"
                >
                  Quitar
                </button>
              </li>
            ))}
        </ul>

        <form onSubmit={agregarMesa} className="mt-2 flex items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] uppercase tracking-widest text-ink/50">Número</label>
            <input
              type="number"
              min={1}
              value={mesaForm.numero}
              onChange={(e) => setMesaForm({ ...mesaForm, numero: Number(e.target.value) })}
              className={`${inputClass} w-24`}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] uppercase tracking-widest text-ink/50">Capacidad</label>
            <input
              type="number"
              min={1}
              value={mesaForm.capacidad}
              onChange={(e) => setMesaForm({ ...mesaForm, capacidad: Number(e.target.value) })}
              className={`${inputClass} w-24`}
            />
          </div>
          <button
            type="submit"
            disabled={agregandoMesa}
            className="rounded-sm bg-onyx px-4 py-2.5 font-mono text-xs uppercase tracking-widest text-paper transition hover:bg-onyx-deep disabled:opacity-50"
          >
            {agregandoMesa ? "..." : "Agregar"}
          </button>
        </form>
      </div>
    </div>
  );
}
