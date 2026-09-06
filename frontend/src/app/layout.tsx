import type { Metadata } from "next";
import { IBM_Plex_Mono, Newsreader, Work_Sans } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Reservas para restaurantes",
  description:
    "Sistema de reservas de mesas para cadenas de restaurantes (Aplicaciones Web II)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${newsreader.variable} ${workSans.variable} ${plexMono.variable}`}
    >
      <body>
        <NavBar />
        <main className="mx-auto max-w-3xl px-6 py-12">{children}</main>
      </body>
    </html>
  );
}
