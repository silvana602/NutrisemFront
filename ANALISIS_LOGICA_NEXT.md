# Auditoría de lógica y buenas prácticas (Next.js)

Fecha: 2026-02-12

## Hallazgos críticos

1. **`middleware` deja públicas todas las rutas por error de prefijos**
   - En `isPublic`, al usar `pathname.startsWith(p)` y tener `"/"` en `PUBLIC_ROUTES`, cualquier ruta hace match.
   - Resultado: el control de acceso no se aplica realmente.

2. **Import con mayúsculas/minúsculas incorrectas rompe build en Linux**
   - `NewConsultationContent.tsx` importa `./patientSelector/PatientSelector` pero la carpeta real es `PatientSelector`.
   - Resultado: `next build` y `tsc` fallan.

3. **Flujo de sesión inconsistente entre login y bootstrap**
   - `LoginForm` guarda la sesión en `localStorage` bajo la clave `session`.
   - `AppSessionBootstrap` intenta recuperar `accessToken` desde la clave `accessToken` y luego llama `AuthService.me(token)`.
   - Resultado: estado no determinista y posible “sesión perdida” tras recarga.

4. **`middleware` y API usan cookies distintas para autenticación**
   - `middleware` espera `accessToken` cookie.
   - `/api/auth/login` solo setea `refreshToken` cookie, y devuelve access token en body.
   - Resultado: desalineación entre política de protección y mecanismo real de login.

5. **Ruta de redirección inexistente en autorización**
   - Ante acceso no permitido, `middleware` redirige a `/dashboard/unauthorized`, pero no existe página para esa ruta.
   - Resultado: mala UX y desvío a 404.

## Hallazgos importantes

6. **Inconsistencia de rutas de paciente (typo)**
   - En `ROLE_ROUTES` se usa `/dashboard/patient/recomendations`.
   - En menús se usa `/dashboard/patient/recommendations`.
   - Resultado: rutas válidas pueden quedar bloqueadas por autorización.

7. **Duplicación de función `getMenuByRole` con reglas distintas**
   - Existe en `src/config/menus.tsx` y también en `src/hooks/useMenuByRol.ts`.
   - Una versión retorna `[]` en default y otra lanza error.
   - Resultado: comportamiento inconsistente y deuda técnica.

8. **Uso de `window.location.href` en login en lugar de navegación Next.js**
   - Fuerza recarga completa y evita optimizaciones del App Router.
   - Recomendado: `useRouter().push(...)`.

9. **Uso de `secure: false` al setear cookie de sesión**
   - Válido en local, pero riesgoso si se arrastra a entornos no locales.
   - Recomendado: condicionar con `process.env.NODE_ENV`.

10. **Archivo hook vacío (`useSession.ts`)**
   - `src/hooks/useSession.ts` está vacío.
   - Resultado: ruido en mantenimiento y confusión sobre la fuente de verdad para sesión.

## Checks ejecutados

- `npm run lint` ✅
- `npm run build` ❌ (falla por import con casing incorrecto)
- `npx tsc --noEmit` ❌ (misma falla de import)
