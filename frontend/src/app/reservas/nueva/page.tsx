"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { branchesApi, Disponibilidad, reservationsApi, Sucursal } from "@/lib/api";
import { useSession } from "@/lib/useSession";

const inputClass =
  "rounded-sm border border-ink/15 bg-paper-dim px-3 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-line focus:outline-none";

const hoy = () => new Date().toISOString().slice(0, 10);

export default function NuevaReservaPage() {
  const router = useRouter();
  const { estado: estadoSesion } = useSession();

  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [sucursalId, setSucursalId] = useState("");
  const [fecha, setFecha] = useState(hoy());
  const [numPersonas, setNumPersonas] = useState(2);
  const [notasEspeciales, setNotas] = useState("");

  const [disponibilidad, setDisponibilidad] = useState<Disponibilidad[] | null>(null);
  const [seleccion, setSeleccion] = useState<{ mesaId: string; horaInicio: string } | null>(null);

  const [buscando, setBuscando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (estadoSesion !== "autenticado") return;
    branchesApi
      .list()
      .then((s) => {
        setSucursales(s);
        if (s[0]) setSucursalId(s[0].id);
      })
      .catch((err) => setError((err as Error).message));
  }, [estadoSesion]);

  const sucursalSel = useMemo(
    () => sucursales.find((s) => s.id === sucursalId),
    [sucursales, sucursalId]
  );

  async function buscarDisponibilidad() {
    setError(null);
    setSeleccion(null);
    setDisponibilidad(null);
    setBuscando(true);
    try {
      const disp = await branchesApi.availability(sucursalId, fecha, numPersonas);
      setDisponibilidad(disp);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBuscando(false);
    }
  }

  async function reservar() {
    if (!seleccion) return;
    setError(null);
    setEnviando(true);
    try {
      await reservationsApi.create({
        sucursalId,
        mesaId: seleccion.mesaId,
        fecha,
        horaInicio: seleccion.horaInicio,
        numPersonas,
        notasEspeciales: notasEspeciales || undefined,
      });
      router.push("/reservas");
    } catch (err) {
      setError((err as Error).message);
      setEnviando(false);
    }
  }

  if (estadoSesion !== "autenticado") {
    return <p className="font-mono text-sm text-paper/50">Cargando...</p>;
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="ticket p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink/50">Nueva comanda</p>
        <h1 className="mt-2 font-display text-2xl italic text-ink">Reservar mesa</h1>

        <div className="mt-6 flex flex-col gap-3">
          <label className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
            Sucursal
          </label>
          <select
            value={sucursalId}
            onChange={(e) => {
              setSucursalId(e.target.value);
              setDisponibilidad(null);
              setSeleccion(null);
            }}
            className={inputClass}
          >
            {sucursales.length === 0 && <option value="">Sin sucursales</option>}
            {sucursales.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre} — {s.direccion}
              </option>
            ))}
          </select>
          {sucursalSel && (
            <p className="font-mono text-xs text-ink/50">
              Horario {sucursalSel.horaApertura}–{sucursalSel.horaCierre} · reservas de{" "}
              {sucursalSel.duracionReservaMin} min
            </p>
          )}

          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1">
              <label className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
                Fecha
              </label>
              <input
                type="date"
                value={fecha}
                min={hoy()}
                onChange={(e) => {
                  setFecha(e.target.value);
                  setDisponibilidad(null);
                  setSeleccion(null);
                }}
                className={inputClass}
              />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <label className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
                Personas
              </label>
              <input
                type="number"
                min={1}
                value={numPersonas}
                onChange={(e) => {
                  setNumPersonas(Number(e.target.value));
                  setDisponibilidad(null);
                  setSeleccion(null);
                }}
                className={inputClass}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={buscarDisponibilidad}
            disabled={!sucursalId || buscando}
            className="mt-1 rounded-sm border border-onyx px-4 py-2.5 font-mono text-xs uppercase tracking-widest text-onyx transition hover:bg-onyx hover:text-paper disabled:opacity-50"
          >
            {buscando ? "Buscando..." : "Ver disponibilidad"}
          </button>
        </div>

        {disponibilidad && (
          <div className="ticket-perforation mt-6 pt-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
              Mesas y horarios libres
            </p>
            {disponibilidad.filter((m) => m.slotsLibres.length > 0).length === 0 && (
              <p className="mt-2 font-mono text-xs text-stamp">
                No hay mesas disponibles para esa fecha y número de personas.
              </p>
            )}
            <div className="mt-3 flex flex-col gap-4">
              {disponibilidad
                .filter((m) => m.slotsLibres.length > 0)
                .map((mesa) => (
                  <div key={mesa.mesaId}>
                    <p className="font-mono text-xs text-ink/60">
                      Mesa {mesa.numero} · {mesa.capacidad} pax
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {mesa.slotsLibres.map((slot) => {
                        const activa =
                          seleccion?.mesaId === mesa.mesaId && seleccion?.horaInicio === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() =>
                              setSeleccion({ mesaId: mesa.mesaId, horaInicio: slot })
                            }
                            className={`rounded-sm border px-3 py-1.5 font-mono text-xs transition ${
                              activa
                                ? "border-onyx bg-onyx text-paper"
                                : "border-ink/20 text-ink hover:border-onyx"
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>

            <textarea
              placeholder="Notas especiales (alergias, ocasión especial)"
              value={notasEspeciales}
              onChange={(e) => setNotas(e.target.value)}
              className={`${inputClass} mt-4 w-full`}
            />

            {error && <p className="mt-3 font-mono text-xs text-stamp">{error}</p>}

            <button
              type="button"
              onClick={reservar}
              disabled={!seleccion || enviando}
              className="mt-3 w-full rounded-sm bg-onyx px-4 py-2.5 font-mono text-xs uppercase tracking-widest text-paper transition hover:bg-onyx-deep disabled:opacity-50"
            >
              {enviando
                ? "Guardando..."
                : seleccion
                  ? `Reservar mesa a las ${seleccion.horaInicio}`
                  : "Elige un horario"}
            </button>
          </div>
        )}

        {error && !disponibilidad && (
          <p className="mt-3 font-mono text-xs text-stamp">{error}</p>
        )}
      </div>
    </div>
  );
}
