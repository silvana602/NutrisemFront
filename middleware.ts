import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_TOKEN_COOKIE_NAME } from "@/lib/auth/constants";
import { verifyAccessToken } from "@/lib/auth/token";
import { isRoleAllowedPath } from "@/lib/auth/roleRouting";

const PUBLIC_ROUTES = ["/", "/401", "/login", "/register", "/auth/login", "/auth/register", "/auth/registro"] as const;
const PROTECTED_PREFIXES = ["/dashboard"] as const;
const UNAUTHORIZED_PATH = "/401";
const FORBIDDEN_PATH = "/403";

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

function buildUnauthorizedUrl(req: NextRequest, nextPath: string) {
  const unauthorizedUrl = new URL(UNAUTHORIZED_PATH, req.url);
  unauthorizedUrl.searchParams.set("next", nextPath);
  return unauthorizedUrl;
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const pathWithQuery = pathname + (search || "");

  if (isPublic(pathname)) return NextResponse.next();
  if (!isProtected(pathname)) return NextResponse.next();

  const token = req.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(buildUnauthorizedUrl(req, pathWithQuery));
  }

  const verifiedToken = await verifyAccessToken(token);
  if (!verifiedToken) {
    const response = NextResponse.redirect(
      buildUnauthorizedUrl(req, pathWithQuery)
    );
    response.cookies.delete(ACCESS_TOKEN_COOKIE_NAME);
    return response;
  }
  const role = verifiedToken.role;

  const isAllowed = isRoleAllowedPath(role, pathname);

  if (!isAllowed) {
    return NextResponse.redirect(new URL(FORBIDDEN_PATH, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|assets/).*)"],
};
