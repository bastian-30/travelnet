# Travelnet

Aplicación turística de Nicaragua: **Next.js (App Router) + React 19 + TypeScript + Tailwind CSS v4** en el frontend, **API Express en TypeScript** y **PostgreSQL**, orquestados con **Docker Compose**.

## Desarrollo

El servidor de desarrollo de Next.js corre en el puerto 8443:

- `npm run dev` — Next.js en http://localhost:8443
- `npm run api` — API Express en TypeScript (requiere PostgreSQL; ver `server/.env.example`)
- `npm run check` — typecheck de frontend (`tsconfig.json`) y backend (`tsconfig.server.json`)
- `npm run build` — build de producción de Next.js (`output: standalone`)
- `npm run format` — formateo con oxfmt

## Estructura

- `app/` — App Router: `layout.tsx`, `providers.tsx` y las páginas (`/`, `/departamentos/[id]`, `/sitios/[departmentId]/[siteId]`, `/en-vivo`, `/resenas`, `/acceso`, `/colaborador`)
- `src/components/` — componentes React (client components); `AuthGate` protege todas las rutas y redirige a `/acceso` si no hay sesión (Firebase Auth)
- `src/context/` — `AuthContext` (Firebase Auth: email/password, sesión persistente del SDK) y `NavigationContext` (navegación por vistas)
- `src/navigation.ts` — tipo `View`, `viewToHref` y `pathnameToViewType`
- `src/services/` — cliente HTTP hacia la API (`NEXT_PUBLIC_API_URL`) y `firebase.ts` (init del SDK con la config del proyecto `travelnet-53faa`)
- `src/data/nicaragua.ts` — datos estáticos (fallback del mapa)
- `server/src/` — API Express en TypeScript: auth Firebase (verificación de ID tokens con `jose`), admin CRUD, streams ANT Media (webhook), contenido, reseñas/destinos
- `scripts/` — CLI en TS (migrate, seed, create-user, docker-env); se ejecutan con tsx
- `database/` — `schema.sql` y `seed.sql` de PostgreSQL
- `docker/` — `api.Dockerfile` (compila TS a `dist/`) y `web.Dockerfile` (Next standalone)
- `compose.yaml` — servicios: db, migrate, api, web, seed, adminer

## Docker

- `npm run docker:env` — genera `.env.docker` con secretos aleatorios
- `npm run docker:up` — stack completo (build, migrate automático, api, web en :8080)
- `npm run docker:down` — para y elimina contenedores
- `npm run docker:migrate` / `npm run docker:seed` — migración y seed manuales
- `npm run docker:logs` — logs de api y web

En Docker, el frontend usa `NEXT_PUBLIC_API_URL=/` y Next.js hace proxy de `/api/*` hacia `http://api:3000` vía rewrites (`API_INTERNAL_URL`). En desarrollo local, el cliente llama directo a `http://127.0.0.1:3000` (CORS ya lo permite).

## Autenticación

Firebase Auth (email/password, proyecto `travelnet-53faa`; config en `src/services/firebase.ts`). El cliente envía el ID token de Firebase como `Authorization: Bearer`; la API lo verifica con `jose` contra las JWKS de Google y enlaza el token (`sub` → columna `users.firebase_uid`, auto-creación de fila si no existe). Roles y permisos siguen en PostgreSQL (`users.role`: user/collaborator/admin). En la consola de Firebase debe estar habilitado el proveedor **Email/Password**.

## Datos

La biblioteca de lugares vive en PostgreSQL: `departments`, `tourist_sites`, `mipymes`, `resenas`, `destinos` y `streams`. `scripts/db-seed.ts` ejecuta `database/seed.sql` y además importa `src/data/nicaragua.ts` (sitios, MIPYMES y reseñas de ejemplo) para siembrar de forma idempotente; ese mismo archivo es el fallback del frontend si la API no responde.

- Catálogo: `useCatalog()` (`src/hooks/useCatalog.ts`) llama a `GET /api/departments` + `GET /api/sites` (con mipymes) y adapta al shape estático de `nicaragua.ts`. Lo usan Navbar, HomePage, NicaMap, DepartmentView, SiteView y ReviewsView.
- Reseñas: `GET/POST /api/resenas` desde ReviewsView (respaldo local `sampleReviews`).
- Transmisiones: se crean desde `/colaborador` (`POST /api/streams`, roles collaborator/admin), se listan con `useLiveStreams` (polling) y el webhook de ANT Media actualiza `status`/`viewer_count` en la tabla `streams`.
- MIPYMES: tabla `mipymes` ligada a `tourist_sites` (FK con cascade); se expone en todos los endpoints de sitios.

## Estilo

Tailwind CSS v4 vía plugin `@tailwindcss/postcss` (`postcss.config.mjs`). Fuentes Fraunces y Nunito se cargan desde Google Fonts en `src/index.css`. No hace falta archivo de configuración de Tailwind.

## Código

- Usar comillas dobles para strings con apóstrofes (`"We're here to help"`).
- Asegurar que las etiquetas JSX estén cerradas y las llaves balanceadas.
- Exportar componentes con export default.
- Casi todos los componentes son `"use client"` (usan localStorage, hls.js, polling).
