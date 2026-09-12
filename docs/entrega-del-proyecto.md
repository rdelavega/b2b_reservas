# Entrega del proyecto (Unidad 6)

**Proyecto:** Sistema de Reservas B2B para Cadenas de Restaurantes
**Asignatura:** Aplicaciones Web II

Este documento es la fuente de contenido de la entrega final: proceso de aseguramiento
de calidad, proceso de liberación y liga en ambiente productivo. La versión con formato
para entregar (portada, Arial 12, interlineado 1.5) es `Entrega-del-Proyecto.pdf`,
generada a partir de `entrega-del-proyecto.html` (ambos locales, no versionados; ver
`.gitignore`).

## 1. Proceso de aseguramiento de calidad

4 niveles de prueba automatizada, 25 pruebas en total, 0 fallos:

| Nivel | Qué prueba | Herramienta | # |
|---|---|---|---|
| Unitarias | Funciones puras, sin BD (horarios, esquemas Zod) | node:test | 9 |
| Integración | Servicios contra PostgreSQL real + API HTTP completa | node:test + fetch | 8 |
| Componentes | Componentes React aislados (jsdom, mocks) | Vitest + Testing Library | 5 |
| E2E | Recorridos de usuario en navegador real | Playwright | 3 |

Comandos:

```bash
cd backend && npm run test:unit        # 9 unitarias, sin BD
cd backend && npm test                 # 17 = unitarias + integración
cd frontend && npm test                # 5 de componentes
cd frontend && npm run test:e2e        # 3 E2E
```

## 2. Proceso de liberación

### 2.1 Estrategia de liberación de componentes
- Trunk-based en `main`; sin ramas de larga vida.
- Despliegue continuo: Vercel (frontend) y Render (backend) redespliegan automáticamente
  en cada push a `main`.
- Frontend y backend se liberan de forma independiente, comunicados sólo por
  `NEXT_PUBLIC_API_URL`.
- Migraciones de base de datos versionadas en `backend/prisma/migrations`, aplicadas en
  cada arranque (`npm run start:prod` corre `prisma migrate deploy` antes de levantar el servidor).
- Secretos y URLs por variables de entorno en cada plataforma, nunca en el repositorio.

### 2.2 Go-live — actividades para la versión inicial
1. Crear la base PostgreSQL en Neon y copiar `DATABASE_URL`.
2. Crear el servicio web en Render desde el blueprint `render.yaml` (configurar `DATABASE_URL`).
3. Verificar `GET /health` → `{"status":"ok"}` (las migraciones se aplican en el primer arranque).
4. (Opcional) `DATABASE_URL="<neon>" npm run prisma:seed` para datos de demostración.
5. Crear el proyecto en Vercel (raíz `frontend/`) con `NEXT_PUBLIC_API_URL` = URL de Render.
6. Configurar `FRONTEND_URL` en Render con el dominio de Vercel y redesplegar (cierra CORS).
7. Prueba de humo manual en producción: registro, login, alta de reserva.
8. Publicar la liga en este documento y en la presentación ejecutiva.

### 2.3 Mantenimiento post-liberación
- **Monitoreo:** `GET /health` como pulso; logs en los dashboards de Render/Vercel.
- **Respaldo:** point-in-time recovery gestionado por Neon.
- **Secretos:** rotar `JWT_SECRET` invalida sesiones activas sin romper nada (no hay estado de sesión en servidor).
- **Dependencias:** `npm audit` antes de cada liberación mayor.
- **Rollback:** revertir el commit en `main`; Vercel/Render redespliegan la versión anterior.
- **Soporte:** issues en el repositorio de GitHub.

## 3. Liga de la aplicación en ambiente productivo

| Componente | Liga |
|---|---|
| Frontend (Vercel) | https://b2b-reservas.vercel.app |
| Backend (Render) | https://reservas-b2b-backend.onrender.com |

Verificado en producción (2026-09-12): `GET /health` responde `{"status":"ok"}`, CORS
correctamente restringido al origen del frontend, y un recorrido completo de usuario
(login → alta de reserva → aparece en el libro → cancelación) contra Vercel + Render +
Neon reales, sin errores de consola.

Usuarios de demostración ya sembrados en la base productiva (contraseña `clave1234`):
`admin@demo.test`, `host@demo.test`, `cliente@demo.test`.

*Nota:* el backend está en el plan gratuito de Render, que suspende el servicio tras
inactividad; la primera solicitud después de un rato sin uso puede tardar ~30-60s en
responder mientras "despierta" (arranque en frío).

## 4. Checklist de entregables

- [x] Proceso de aseguramiento de calidad, con resultados.
- [x] Proceso de liberación (estrategia, go-live, mantenimiento).
- [x] Liga en ambiente productivo, verificada extremo a extremo.
- [x] Repositorio integrado (`github.com/rdelavega/b2b_reservas`, rama `main`).
- [x] Manual de usuario (`Manual-de-Usuario.pdf`, local).
- [x] Presentación ejecutiva con speech de venta (`Presentacion-Ejecutiva.pdf`, local).
