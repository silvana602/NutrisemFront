import { NextResponse, type NextRequest } from "next/server";
import { decodeToken } from "@/utils/decodeToken";

// Nombre de la cookie donde guardas el token
const SESSION_COOKIE = "accessToken";

/** Rutas públicas (sin protección) */
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/auth/login",
  "/auth/registro",
] as const;

/** Prefijos protegidos (requieren sesión) */
const PROTECTED_PREFIXES = ["/dashboard"] as const;

/**
 * Rutas permitidas según el rol real de NUTRISEM
 */
const ROLE_ROUTES: Record<string, string[]> = {
  admin: [
    "/dashboard/admin",
    "/dashboard/usuarios",
    "/dashboard/diagnosticos",
    "/dashboard/consultas",
    "/dashboard/historiales",
    "/dashboard/reportes",
  ],

  medico: [
    "/dashboard/inicio-medico",
    "/dashboard/mis-pacientes",
    "/dashboard/nueva-consulta",
    "/dashboard/diagnosticos",
    "/dashboard/historiales",
    "/dashboard/reportes",
  ],

  tutor: [
    "/dashboard/tutor",
    "/dashboard/tutor/progreso",
    "/dashboard/tutor/diagnosticos",
    "/dashboard/tutor/recomendaciones",
  ],
};

/** Determina si la ruta necesita sesión */
function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/** Determina si una ruta es pública */
function isPublic(pathname: string) {
  return PUBLIC_ROUTES.some((p) => pathname === p || pathname.startsWith(p));
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // 🔹 SI ES RUTA PÚBLICA → SIGUE
  if (isPublic(pathname)) return NextResponse.next();

  // 🔹 SI NO ES PROTEGIDA → SIGUE
  if (!isProtected(pathname)) return NextResponse.next();

  // 🔹 Leer token desde cookie
  const token = req.cookies.get(SESSION_COOKIE)?.value;

  // Sin token → redirigir a login con ?next=...
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname + (search || ""));
    return NextResponse.redirect(loginUrl);
  }

  // 🔹 Decodificar token
  const decoded = decodeToken<{ rol?: string; exp?: number }>(token);

  if (!decoded || !decoded.rol) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = decoded.rol.toLowerCase();

  // Validación de expiración
  const expMs = decoded.exp ? decoded.exp * 1000 : null;
  const expired = !expMs || Date.now() >= expMs;

  if (expired) {
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete(SESSION_COOKIE);
    return res;
  }

  // Validación de rutas permitidas por rol
  const allowedRoutes = ROLE_ROUTES[role];

  if (!allowedRoutes) {
    return NextResponse.redirect(new URL("/dashboard/unauthorized", req.url));
  }

  const isAllowed = allowedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isAllowed) {
    return NextResponse.redirect(new URL("/dashboard/unauthorized", req.url));
  }

  return NextResponse.next();
}

/**
 * Exclusiones para evitar interferencia:
 *  - /api
 *  - /_next
 *  - assets estáticos
 */
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|assets/).*)",
  ],
};
