import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Datos de demostración para consumir el frontend (Fase 4).
 * Reejecutable: usa upsert por email / claves naturales.
 */
async function main() {
  const passwordHash = await bcrypt.hash("clave1234", 10);

  const centro = await prisma.sucursal.upsert({
    where: { id: "seed-sucursal-centro" },
    update: {},
    create: {
      id: "seed-sucursal-centro",
      nombre: "Sucursal Centro",
      direccion: "Av. Juárez 100, Centro Histórico",
      horaApertura: "12:00",
      horaCierre: "23:00",
      duracionReservaMin: 90,
    },
  });

  const norte = await prisma.sucursal.upsert({
    where: { id: "seed-sucursal-norte" },
    update: {},
    create: {
      id: "seed-sucursal-norte",
      nombre: "Sucursal Norte",
      direccion: "Blvd. Independencia 2450, Zona Norte",
      horaApertura: "13:00",
      horaCierre: "22:00",
      duracionReservaMin: 120,
    },
  });

  for (const sucursalId of [centro.id, norte.id]) {
    for (let numero = 1; numero <= 6; numero++) {
      await prisma.mesa.upsert({
        where: { sucursalId_numero: { sucursalId, numero } },
        update: {},
        create: { sucursalId, numero, capacidad: numero <= 2 ? 2 : numero <= 4 ? 4 : 8 },
      });
    }
  }

  await prisma.usuario.upsert({
    where: { email: "admin@demo.test" },
    update: {},
    create: { nombre: "Admin Demo", email: "admin@demo.test", passwordHash, rol: "ADMIN" },
  });

  await prisma.usuario.upsert({
    where: { email: "host@demo.test" },
    update: { sucursalId: centro.id },
    create: {
      nombre: "Host Centro",
      email: "host@demo.test",
      passwordHash,
      rol: "HOST",
      sucursalId: centro.id,
    },
  });

  await prisma.usuario.upsert({
    where: { email: "cliente@demo.test" },
    update: {},
    create: { nombre: "Cliente Demo", email: "cliente@demo.test", passwordHash, rol: "CLIENTE" },
  });

  console.log("Seed completo. Usuarios: admin@demo.test / host@demo.test / cliente@demo.test (clave1234)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
