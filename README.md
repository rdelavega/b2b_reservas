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

### Pruebas

```bash
npm run test:unit        # unitarias puras (sin BD): horarios y esquemas Zod
npm test                 # unitarias + integración (servicios/ORM + API HTTP)
npm run test:integration # sólo la prueba de integración frontend↔backend
```

## Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev                 # http://localhost:3000
```

### Pruebas de componentes (Vitest) y E2E (Playwright)

```bash
cd frontend
npm test                          # componentes (React Testing Library)

npx playwright install chromium   # sólo la primera vez
npm run test:e2e                  # E2E; requiere PostgreSQL disponible
```

## Despliegue a producción

- **Base de datos:** PostgreSQL gestionado en [Neon](https://neon.tech).
- **Backend:** [Render](https://render.com), a partir del blueprint [`render.yaml`](./render.yaml).
- **Frontend:** [Vercel](https://vercel.com), raíz del proyecto = `frontend/`.

Pasos detallados de go-live y mantenimiento en
[`docs/entrega-del-proyecto.md`](./docs/entrega-del-proyecto.md).

## Documentación

- [`docs/fase-4-desarrollo-frontend.md`](./docs/fase-4-desarrollo-frontend.md) —
  entramado frontend, mapa pantalla→endpoint, justificación de REST y resultados de
  pruebas de humo.
- [`docs/entrega-del-proyecto.md`](./docs/entrega-del-proyecto.md) — QA, proceso de
  liberación, go-live y mantenimiento post-liberación.
- Informes con formato para entregar (PDF, generados localmente, no versionados):
  `docs/Entrega-del-Proyecto.pdf`, `docs/Manual-de-Usuario.pdf`,
  `docs/Presentacion-Ejecutiva.pdf`. Sus fuentes HTML están junto a cada uno en `docs/`.
