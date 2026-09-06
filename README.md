# Reservas B2B

Sistema de reservas de mesas para cadenas de restaurantes. Backend Node.js/Express/
Prisma + frontend Next.js. Ver el detalle de cada fase en [`docs/`](./docs).

## Requisitos

- Node.js 20+
- PostgreSQL (local o vía Docker)

```bash
docker run -d --name reservas-pg \
  -e POSTGRES_USER=usuario -e POSTGRES_PASSWORD=password -e POSTGRES_DB=reservas_b2b \
  -p 5432:5432 postgres:16-alpine
```

## Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate deploy   # o: npm run prisma:migrate
npm run prisma:seed         # datos de demostración
npm run dev                 # http://localhost:4000
```

Usuarios de demostración (contraseña `clave1234`): `admin@demo.test`,
`host@demo.test`, `cliente@demo.test`.

### Pruebas de humo

```bash
npm test                 # Fase 3 (servicios/ORM) + Fase 4 (integración HTTP)
npm run test:integration # sólo la prueba de integración frontend↔backend
```

## Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev                 # http://localhost:3000
```

### Pruebas E2E (Playwright)

Requiere PostgreSQL disponible. `webServer` levanta backend + frontend con seed.

```bash
cd frontend
npx playwright install chromium   # sólo la primera vez
npm run test:e2e
```

## Documentación

- [`docs/fase-4-desarrollo-frontend.md`](./docs/fase-4-desarrollo-frontend.md) —
  entramado frontend, mapa pantalla→endpoint, justificación de REST y resultados de
  pruebas de humo.
