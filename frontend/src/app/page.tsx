import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-line">Libro de reservas</p>
        <h1 className="mt-3 font-display text-4xl italic leading-tight text-paper">
          Cada mesa, cada hora,
          <br />
          una comanda a la vez.
        </h1>
        <div className="mt-6 h-px w-16 bg-line" />
        <p className="mt-6 max-w-md text-paper/70">
          Sistema de reservas para cadenas de restaurantes: cada sucursal administra su
          disponibilidad, cada anfitrión atiende su turno, cada cliente guarda su lugar.
        </p>
      </div>

      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-sm bg-line px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-onyx-deep transition hover:bg-line-bright"
        >
          Ingresar
        </Link>
        <Link
          href="/reservas"
          className="rounded-sm border border-line/40 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-paper transition hover:border-line hover:text-line-bright"
        >
          Ver reservas
        </Link>
      </div>
    </div>
  );
}
