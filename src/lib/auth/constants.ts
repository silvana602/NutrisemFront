export const ACCESS_TOKEN_COOKIE_NAME = "accessToken";
export const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

export const ACCESS_TOKEN_TTL_SECONDS = 60 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

export const JWT_ISSUER = "nutrisem";
export const JWT_AUDIENCE = "nutrisem-web";

export function getJwtSecret(): string {
  const configuredSecret = process.env.JWT_SECRET;

  if (configuredSecret) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV !== "production") {
    return "nutrisem-dev-only-secret";
  }

  throw new Error("JWT_SECRET no configurado en produccion");
}
