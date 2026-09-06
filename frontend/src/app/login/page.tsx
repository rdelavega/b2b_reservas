"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api";
import { saveSession } from "@/lib/session";

const inputClass =
  "rounded-sm border border-ink/15 bg-paper-dim px-3 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-line focus:outline-none";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const expirada = params.get("expirada") === "1";
  const registrado = params.get("registrado") === "1";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const { token, usuario } = await authApi.login(email, password);
      saveSession(token, usuario);
      router.push("/reservas");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <div className="ticket p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink/50">Acceso de personal</p>
        <h1 className="mt-2 font-display text-2xl italic text-ink">Iniciar sesión</h1>

        {expirada && (
          <p className="mt-3 font-mono text-xs text-stamp">
            Tu sesión expiró. Ingresa de nuevo.
          </p>
        )}
        {registrado && (
          <p className="mt-3 font-mono text-xs text-onyx">
            Cuenta creada. Ya puedes iniciar sesión.
          </p>
        )}

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputClass}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={inputClass}
          />
          {error && <p className="font-mono text-xs text-stamp">{error}</p>}
          <button
            type="submit"
            disabled={cargando}
            className="mt-2 rounded-sm bg-onyx px-4 py-2.5 font-mono text-xs uppercase tracking-widest text-paper transition hover:bg-onyx-deep disabled:opacity-50"
          >
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="mt-4 font-mono text-xs text-ink/50">
          ¿Sin cuenta?{" "}
          <Link href="/registro" className="text-onyx underline">
            Crear una
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
