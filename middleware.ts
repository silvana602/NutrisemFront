import { NextResponse, type NextRequest } from "next/server";
import { decodeToken } from "@/utils/decodeToken";
import { UserRole } from "@/types/user";

const SESSION_COOKIE = "accessToken";

const PUBLIC_ROUTES = ["/", "/login", "/register", "/auth/login", "/auth/register", "/auth/registro"] as const;
const PROTECTED_PREFIXES = ["/dashboard"] as const;

const ROLE_ROUTES: Record<UserRole, string[]> = {
  [UserRole.admin]: [
    "/dashboard/admin",
    "/dashboard/admin/users",
    "/dashboard/admin/reports",
    "/dashboard/admin/histories",
  ],
  [UserRole.clinician]: [
    "/dashboard/clinician",
    "/dashboard/clinician/patients",
    "/dashboard/clinician/consultation",
    "/dashboard/clinician/diagnosis",
    "/dashboard/clinician/reports",
  ],
  [UserRole.patient]: [
    "/dashboard/patient",
    "/dashboard/patient/progress",
    "/dashboard/patient/diagnosis",
    "/dashboard/patient/recommendations",
  ],
};

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function isPublic(pathname: string) {
  return PUBLIC_ROUTES.some((p) => {
    if (p === "/") return pathname === "/";
    return pathname === p || pathname.startsWith(`${p}/`);
  });
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();
  if (!isProtected(pathname)) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname + (search || ""));
    return NextResponse.redirect(loginUrl);
  }

  const decoded = decodeToken<{ role?: UserRole; exp?: number }>(token);
  const role = decoded?.role;

  if (!role || !Object.values(UserRole).includes(role)) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const expMs = decoded.exp ? decoded.exp * 1000 : null;
  if (!expMs || Date.now() >= expMs) {
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete(SESSION_COOKIE);
    return res;
  }

  const allowedRoutes = ROLE_ROUTES[role];
  const isAllowed = allowedRoutes.some((route) => pathname.startsWith(route));

  if (!isAllowed) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|assets/).*)"],
};
