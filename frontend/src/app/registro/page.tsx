"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi, Rol } from "@/lib/api";

const inputClass =
  "rounded-sm border border-ink/15 bg-paper-dim px-3 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-line focus:outline-none";

export default function RegistroPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nombre: "", email: "", password: "", rol: "CLIENTE" as Rol });
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await authApi.register(form);
      router.push("/login?registrado=1");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <div className="ticket p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink/50">Nuevo acceso</p>
        <h1 className="mt-2 font-display text-2xl italic text-ink">Crear cuenta</h1>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
          <input
            placeholder="Nombre completo"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
            minLength={2}
            className={inputClass}
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className={inputClass}
          />
          <input
            type="password"
            placeholder="Contraseña (mín. 8 caracteres)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={8}
            className={inputClass}
          />
          <select
            value={form.rol}
            onChange={(e) => setForm({ ...form, rol: e.target.value as Rol })}
            className={inputClass}
          >
            <option value="CLIENTE">Cliente</option>
            <option value="HOST">Host / Encargado</option>
            <option value="ADMIN">Administrador</option>
          </select>
          {error && <p className="font-mono text-xs text-stamp">{error}</p>}
          <button
            type="submit"
            disabled={enviando}
            className="mt-2 rounded-sm bg-onyx px-4 py-2.5 font-mono text-xs uppercase tracking-widest text-paper transition hover:bg-onyx-deep disabled:opacity-50"
          >
            {enviando ? "Creando..." : "Registrarme"}
          </button>
        </form>

        <p className="mt-4 font-mono text-xs text-ink/50">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-onyx underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
