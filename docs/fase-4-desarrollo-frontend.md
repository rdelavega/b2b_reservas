# Fase 4 — Desarrollo de Frontend

**Proyecto:** Sistema de Reservas B2B para Cadenas de Restaurantes
**Asignatura:** Aplicaciones Web II
**Entrega:** Fase 4 (Unidad 5) — Desarrollo del entramado frontend y pruebas de humo de su integración con backend.

---

## 1. Resumen ejecutivo

En la Fase 3 el backend quedó operando la funcionalidad completa de manipulación de
datos (auth, sucursales, mesas y reservas) sobre PostgreSQL a través del ORM Prisma,
con sus servicios listos para ser consumidos. La Fase 4 construye el **entramado
frontend** que consume esos servicios por HTTP, de modo que un usuario real puede
ejecutar el CRUD completo desde la interfaz, y añade **pruebas de humo** que validan
la integración extremo a extremo.

El frontend es una aplicación **Next.js 16 (App Router) + React 19 + Tailwind CSS 4**.
Toda la comunicación con el backend se centraliza en un único cliente HTTP
(`frontend/src/lib/api.ts`) y la sesión se gestiona con JWT almacenado en el
navegador.

---

## 2. Arquitectura de consumo de servicios

```
Navegador
  │
  ├─ Componentes de página (app/**/page.tsx)   ← "use client"
  │     │  llaman a
  │     ▼
  ├─ Cliente API  (lib/api.ts)
  │     │  fetch() con  Authorization: Bearer <JWT>
  │     │  - inyecta el token desde localStorage
  │     │  - normaliza errores en ApiError { message, status }
  │     │  - ante 401: limpia la sesión y redirige a /login
  │     ▼
  └─ Backend Express (http://localhost:4000)
        /auth   /branches   /reservations
```

### 2.1 Gestión de sesión

| Elemento | Responsabilidad |
|---|---|
| `lib/session.ts` | Store de sesión (`token` + `usuario`) sobre `localStorage`, expuesto a React con `useSyncExternalStore`; se sincroniza entre pestañas con el evento `storage`. |
| `lib/useSession.ts` | Hook de guarda: expone `{ usuario, estado }` y redirige a `/login` si no hay sesión, o a `/reservas` si el rol no está autorizado. |
| `components/NavBar.tsx` | Navegación reactiva: muestra nombre y rol, y sólo los enlaces permitidos (p. ej. **Sucursales** solo para `ADMIN`). |
| `lib/api.ts` (interceptor 401) | Si el backend responde 401 (token ausente/expirado) se limpia la sesión y se fuerza el regreso a `/login?expirada=1`. |

El token expira a los 15 minutos (configurable en `JWT_EXPIRES_IN`). No se implementó
*refresh token* por tratarse de un alcance académico; la expiración se maneja de forma
transparente devolviendo al usuario al login.

### 2.2 Mapa pantalla → servicio backend

| Pantalla (ruta) | Acción de usuario | Método `lib/api.ts` | Endpoint backend | Rol |
|---|---|---|---|---|
| `/registro` | Alta de cuenta | `authApi.register` | `POST /auth/register` | público |
| `/login` | Inicio de sesión | `authApi.login` | `POST /auth/login` | público |
| `/perfil` | Ver identidad | `authApi.me` | `GET /auth/me` | autenticado |
| `/perfil` | Cambiar contraseña | `authApi.changePassword` | `PATCH /auth/password` | autenticado |
| `/reservas` | Consultar (Leer) | `reservationsApi.list` | `GET /reservations` | autenticado |
| `/reservas` | Confirmar reserva | `reservationsApi.confirm` | `PATCH /reservations/:id` | HOST / ADMIN |
| `/reservas/nueva` | Listar sucursales | `branchesApi.list` | `GET /branches` | autenticado |
| `/reservas/nueva` | Consultar disponibilidad | `branchesApi.availability` | `GET /branches/:id/availability` | autenticado |
| `/reservas/nueva` | Alta de reserva (Crear) | `reservationsApi.create` | `POST /reservations` | autenticado |
| `/reservas/:id/editar` | Cargar reserva | `reservationsApi.getOne` | `GET /reservations/:id` | autenticado |
| `/reservas/:id/editar` | Cambio de reserva (Actualizar) | `reservationsApi.update` | `PATCH /reservations/:id` | autenticado |
| `/reservas/:id/cancelar` | Baja de reserva (Borrar lógico) | `reservationsApi.cancel` | `DELETE /reservations/:id` | autenticado |
| `/sucursales` | Consultar sucursales | `branchesApi.list` | `GET /branches` | ADMIN |
| `/sucursales` | Alta de sucursal | `branchesApi.create` | `POST /branches` | ADMIN |
| `/sucursales/:id` | Detalle de sucursal | `branchesApi.getOne` | `GET /branches/:id` | ADMIN |
| `/sucursales/:id` | Cambio de sucursal | `branchesApi.update` | `PATCH /branches/:id` | ADMIN |
| `/sucursales/:id` | Baja de sucursal | `branchesApi.remove` | `DELETE /branches/:id` | ADMIN |
| `/sucursales/:id` | Alta de mesa | `branchesApi.addMesa` | `POST /branches/:id/mesas` | ADMIN |
| `/sucursales/:id` | Baja de mesa | `branchesApi.removeMesa` | `DELETE /branches/:id/mesas/:mesaId` | ADMIN |

Con esto quedan cubiertas en la interfaz las cuatro operaciones del CRUD (**Altas,
Bajas, Cambios, Consultas**) sobre las dos entidades de negocio: **reservas** y
**sucursales/mesas**.

### 2.3 Ajustes de backend para el consumo

Para que el frontend muestre información con sentido y pueda leer la identidad real
del usuario se añadió lo mínimo necesario:

1. **`GET /auth/me`** — devuelve `{ id, nombre, email, rol, sucursalId }` a partir del
   token; sustituye la lectura de datos cacheados en el navegador.
2. **Reservas con relaciones** — el repositorio incluye `sucursal` y `mesa` en las
   respuestas de listado/detalle/alta/cambio/baja, para mostrar "Sucursal Centro ·
   Mesa 3" en lugar de identificadores.
3. **Esquemas Zod** — los identificadores pasan de `uuid()` a "cadena no vacía", de
   modo que se admiten tanto los UUID generados por Prisma como los IDs legibles del
   *seed* de demostración.

---

## 3. Justificación: REST y no WebSockets

Los lineamientos piden justificar el uso de *websockets* en caso de emplearlos. **Este
proyecto no los utiliza**; toda la comunicación es **HTTP/REST petición-respuesta**.
Razones:

- Las operaciones son **transaccionales y iniciadas por el usuario** (crear, editar,
  cancelar una reserva; administrar sucursales). No hay flujo de datos continuo que
  justifique una conexión persistente.
- **No hay colaboración en tiempo real** entre varios usuarios sobre el mismo recurso
  ni necesidad de *push* del servidor al cliente. La disponibilidad de mesas se
  consulta **bajo demanda** al abrir la pantalla de nueva reserva.
- REST sobre HTTP es **más simple de operar, cachear, depurar y escalar** (sin estado
  de conexión en el servidor), y encaja con el modelo CRUD del proyecto.
- Las notificaciones al cliente (confirmación, cancelación, reprogramación) se
  resuelven por **correo electrónico** desde el backend, no por canal en vivo.

Si en el futuro se requiriera un tablero de ocupación de mesas actualizado al
instante para el *host*, entonces sí se evaluaría WebSockets o *Server-Sent Events*
para esa vista concreta.

---

## 4. Pruebas de humo de la integración frontend ↔ backend

Se implementaron **dos niveles** de prueba de humo, ambos contra el backend y la base
de datos reales.

### 4.1 Nivel API — `backend/src/tests/http-smoke.test.ts`

Levanta la aplicación Express en un puerto efímero y ejercita **por HTTP** los mismos
endpoints, en el mismo orden, que consume `frontend/src/lib/api.ts`. Es la prueba de
que "los servicios están listos para ser consumidos por el frontend".

Ejecutar:

```bash
cd backend
npm run test:integration      # sólo la prueba de integración
npm test                      # todas las pruebas de humo (Fase 3 + Fase 4)
```

**Resultado (`npm test`):**

```
# Subtest: salud del backend
ok 1 - salud del backend
# Subtest: auth: registro, login y perfil (/auth/me)
ok 2 - auth: registro, login y perfil (/auth/me)
# Subtest: sucursales: alta de sucursal y mesa, listado y disponibilidad
ok 3 - sucursales: alta de sucursal y mesa, listado y disponibilidad
# Subtest: reservas: alta, consulta con relaciones, cambio, confirmación y baja
ok 4 - reservas: alta, consulta con relaciones, cambio, confirmación y baja
# Subtest: auth: cambio de contraseña y bloqueo sin token
ok 5 - auth: cambio de contraseña y bloqueo sin token
# Subtest: auth: registro, login y cambio de contraseña
ok 6 - auth: registro, login y cambio de contraseña
# Subtest: sucursales: alta, consulta, cambio y disponibilidad
ok 7 - sucursales: alta, consulta, cambio y disponibilidad
# Subtest: reservas: alta, consulta, cambio y baja (cancelación)
ok 8 - reservas: alta, consulta, cambio y baja (cancelación)
1..8
# tests 8
# pass 8
# fail 0
```

### 4.2 Nivel E2E (navegador) — `frontend/e2e/reservas.spec.ts`

Pruebas con **Playwright** que abren un navegador real. Antes de la suite,
`globalSetup` reseeda la base de datos (estado conocido) y el `webServer` de
Playwright levanta backend + frontend; las pruebas validan el recorrido del usuario
a través de la UI.

| Prueba | Qué valida |
|---|---|
| `un cliente crea, edita y cancela una reserva desde la UI` | CRUD completo de reserva desde el navegador: selección de sucursal, consulta de disponibilidad, alta, verificación en el libro, cambio de personas y cancelación (estado `CANCELADA`). |
| `sin sesión, /reservas redirige a /login` | La guarda de sesión del frontend funciona. |
| `un admin da de alta una sucursal y una mesa` | CRUD de sucursales/mesas desde la UI con rol `ADMIN`. |

Ejecutar (requiere PostgreSQL disponible, p. ej. el contenedor `reservas-pg`):

```bash
cd frontend
npm run test:e2e
```

**Resultado:**

```
Running 3 tests using 1 worker

  ✓  1 [chromium] › e2e/reservas.spec.ts:19:5 › un cliente crea, edita y cancela una reserva desde la UI (3.1s)
  ✓  2 [chromium] › e2e/reservas.spec.ts:57:5 › sin sesión, /reservas redirige a /login (312ms)
  ✓  3 [chromium] › e2e/reservas.spec.ts:63:5 › un admin da de alta una sucursal y una mesa (1.5s)

  3 passed (9.1s)
```

---

## 5. Cómo reproducir el entorno

### 5.1 Base de datos (PostgreSQL vía Docker)

```bash
docker run -d --name reservas-pg \
  -e POSTGRES_USER=usuario -e POSTGRES_PASSWORD=password -e POSTGRES_DB=reservas_b2b \
  -p 5432:5432 postgres:16-alpine
```

### 5.2 Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate deploy      # aplica el esquema
npm run prisma:seed            # datos de demostración
npm run dev                    # http://localhost:4000
```

Usuarios de demostración (contraseña `clave1234`):

| Correo | Rol |
|---|---|
| `admin@demo.test` | ADMIN |
| `host@demo.test` | HOST (Sucursal Centro) |
| `cliente@demo.test` | CLIENTE |

### 5.3 Frontend

```bash
cd frontend
cp .env.local.example .env.local     # NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev                          # http://localhost:3000
```

---

## 6. Entregables de la fase

- [x] Entramado frontend con solicitudes a backend integradas (`frontend/src/`, cliente `lib/api.ts`).
- [x] CRUD completo consumible desde la interfaz para reservas y sucursales/mesas.
- [x] Pruebas de humo de la integración frontend ↔ backend (API + E2E) con resultados.
- [x] Documento ejecutivo (este archivo) con la justificación de REST.
- [x] Integración en el repositorio (rama `main`).
