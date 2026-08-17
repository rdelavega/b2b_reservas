import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Sistema de Reservas B2B para Cadenas de Restaurantes</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Prototipo de Fase 2: entramado de servicios (backend Node.js/Express + Prisma) y pantallas
        (frontend Next.js) para la gestión de reservas de mesas.
      </p>
      <div className="flex gap-4">
        <Link href="/login" className="rounded bg-zinc-900 px-4 py-2 text-white dark:bg-zinc-100 dark:text-black">
          Iniciar sesión
        </Link>
        <Link href="/reservas" className="rounded border px-4 py-2">
          Ver reservas
        </Link>
      </div>
    </div>
  );
}
