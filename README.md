# Nutrisem Front

Aplicacion web de monitoreo nutricional pediatrico construida con Next.js (App Router), React y TypeScript.

## Requisitos

- Node.js 20+
- npm 11+

## Package Manager Oficial

Este repositorio usa **npm** como package manager oficial.

## Variables de Entorno

Crear `.env.local` con:

```env
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
# Recomendado en todos los entornos:
JWT_SECRET=tu_secreto_seguro
```

Notas:
- `JWT_SECRET` es obligatorio en produccion.
- `NEXT_PUBLIC_API_URL` por defecto puede apuntar a `/api` en el mismo host.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run test:unit
npm run test:integration
npm run test:e2e
```

Para e2e (primera vez):

```bash
npx playwright install chromium
```

## Flujo de Autenticacion

1. Login en `POST /api/auth/login`.
2. El servidor valida credenciales y emite cookies `httpOnly`:
   - `accessToken`
   - `refreshToken`
3. El cliente **no** guarda JWT en `localStorage`.
4. En arranque, `AppSessionBootstrap` consulta `GET /api/auth/me` para hidratar usuario en store.
5. `middleware.ts` verifica JWT de forma criptografica y valida permisos de ruta por rol.
6. Logout en `POST /api/auth/logout` limpiando cookies en servidor.

## Estructura Principal

```text
src/
  app/
    (auth)/
    api/auth/
    dashboard/
  components/
    auth/
    layout/
    organisms/
    ui/
  hooks/
    auth/
  lib/
    auth/
  mocks/
  store/
  types/
  utils/
middleware.ts
```

## Testing

- Unit tests: `tests/unit`
- Integration tests: `tests/integration`
- E2E tests: `tests/e2e`

Cobertura minima agregada:
- validadores y utilidades de token seguro.
- integracion de `POST /api/auth/login`.
- flujo e2e de login con redireccion por rol.

## Convenciones

- Mantener componentes de UI enfocados en render y handlers minimos.
- Mover logica reutilizable a `hooks/` y `lib/`.
- Evitar persistir datos sensibles en storage del navegador.
