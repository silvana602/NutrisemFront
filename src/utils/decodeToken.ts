function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Decodifica un JWT sin verificar la firma.
 * Devuelve el payload como un tipo generico T.
 */
export function decodeToken<T = Record<string, unknown>>(
  token: string
): T | null {
  try {
    if (!token || typeof token !== "string") return null;

    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join("")
    );

    return JSON.parse(jsonPayload) as T;
  } catch (error: unknown) {
    console.error("Error al decodificar token:", error);
    return null;
  }
}

/**
 * Devuelve la fecha de expiracion del token (exp) en milisegundos.
 */
export function getTokenExpiration(token: string): number | null {
  const decoded = decodeToken<{ exp: number }>(token);
  if (!decoded?.exp) return null;
  return decoded.exp * 1000;
}

/**
 * Retorna true si el token ya expiro.
 */
export function isTokenExpired(token: string): boolean {
  const expMs = getTokenExpiration(token);
  if (!expMs) return true;
  return Date.now() >= expMs;
}

/**
 * Retorna el usuario decodificado dentro del token.
 */
export function getDecodedUser<T = Record<string, unknown>>(
  token: string
): T | null {
  const decoded = decodeToken<Record<string, unknown>>(token);
  if (!decoded) return null;

  if ("user" in decoded && decoded.user !== undefined) {
    return decoded.user as T;
  }

  return decoded as T;
}

/**
 * Procesa un token y devuelve user, expiracion e indicador de expiracion.
 */
export function processToken<T = Record<string, unknown>>(token: string) {
  const user = getDecodedUser<T>(token);
  const exp = getTokenExpiration(token);

  return {
    user,
    exp,
    isExpired: !exp || Date.now() >= exp,
  };
}

export { isRecord };
