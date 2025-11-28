/**
 * Decodifica un JWT sin verificar la firma.
 * Devuelve el payload como un tipo genérico T.
 */
export function decodeToken<T = any>(token: string): T | null {
    try {
        if (!token || typeof token !== "string") return null;

        const parts = token.split(".");
        if (parts.length !== 3) return null;

        const payload = parts[1];

        // Base64URL → Base64
        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");

        // Decodificar
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );

        return JSON.parse(jsonPayload) as T;
    } catch (error) {
        console.error("Error al decodificar token:", error);
        return null;
    }
}

/**
 * Devuelve la fecha de expiración del token (exp) en milisegundos.
 */
export function getTokenExpiration(token: string): number | null {
    const decoded = decodeToken<{ exp: number }>(token);
    if (!decoded?.exp) return null;

    // JWT usa segundos → convertir a milisegundos
    return decoded.exp * 1000;
}

/**
 * Retorna true si el token ya expiró.
 */
export function isTokenExpired(token: string): boolean {
    const expMs = getTokenExpiration(token);
    if (!expMs) return true;

    return Date.now() >= expMs;
}

/**
 * Retorna el usuario decodificado dentro del token.
 * Útil para cargar datos al store sin otra petición HTTP.
 */
export function getDecodedUser<T = any>(token: string): T | null {
    const decoded = decodeToken<{ user?: T }>(token);

    // Si tu backend manda directamente los datos del usuario
    if (decoded && (decoded as any).user) {
        return (decoded as any).user as T;
    }

    // Si tu backend mete todo el contenido directamente en el payload
    return decoded as T;
}

/**
 * Helper pro: Procesa un token y devuelve:
 * - user → datos del usuario
 * - exp → expiración en ms
 * - isExpired → boolean
 * 
 * Perfecto para cargar al Zustand store.
 */
export function processToken<T = any>(token: string) {
    const user = getDecodedUser<T>(token);
    const exp = getTokenExpiration(token);

    return {
        user,
        exp,
        isExpired: !exp || Date.now() >= exp
    };
}
