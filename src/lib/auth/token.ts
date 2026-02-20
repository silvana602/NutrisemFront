import type { UserRole } from "@/types/user";
import { UserRole as UserRoleEnum } from "@/types/user";
import {
  ACCESS_TOKEN_TTL_SECONDS,
  JWT_AUDIENCE,
  JWT_ISSUER,
  getJwtSecret,
} from "@/lib/auth/constants";

type JwtHeader = {
  alg?: string;
  typ?: string;
};

type JwtPayload = {
  sub?: string;
  role?: unknown;
  exp?: number;
  iat?: number;
  nbf?: number;
  iss?: string;
  aud?: string | string[];
};

export type VerifiedAccessToken = {
  userId: string;
  role: UserRole;
  exp: number;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function isUserRole(value: unknown): value is UserRole {
  return (
    typeof value === "string" &&
    (Object.values(UserRoleEnum) as string[]).includes(value)
  );
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(base64Url: string): Uint8Array | null {
  try {
    const base64 = base64Url
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(base64Url.length / 4) * 4, "=");
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
  } catch {
    return null;
  }
}

function parseJwtPart<T>(value: string): T | null {
  const bytes = fromBase64Url(value);
  if (!bytes) return null;

  try {
    return JSON.parse(decoder.decode(bytes)) as T;
  } catch {
    return null;
  }
}

async function signHmacSha256(data: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(data)
  );

  return new Uint8Array(signatureBuffer);
}

async function verifyHmacSha256(
  data: string,
  signature: Uint8Array,
  secret: string
) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const normalizedSignature = new Uint8Array(signature.byteLength);
  normalizedSignature.set(signature);

  return crypto.subtle.verify(
    "HMAC",
    key,
    normalizedSignature,
    encoder.encode(data)
  );
}

function hasValidAudience(audience: JwtPayload["aud"]) {
  if (typeof audience === "string") {
    return audience === JWT_AUDIENCE;
  }

  if (Array.isArray(audience)) {
    return audience.includes(JWT_AUDIENCE);
  }

  return false;
}

export async function createAccessToken(userId: string, role: UserRole) {
  const now = Math.floor(Date.now() / 1000);
  const header = toBase64Url(
    encoder.encode(
      JSON.stringify({
        alg: "HS256",
        typ: "JWT",
      } satisfies JwtHeader)
    )
  );
  const payload = toBase64Url(
    encoder.encode(
      JSON.stringify({
        sub: userId,
        role,
        iat: now,
        exp: now + ACCESS_TOKEN_TTL_SECONDS,
        iss: JWT_ISSUER,
        aud: JWT_AUDIENCE,
      } satisfies JwtPayload)
    )
  );
  const input = `${header}.${payload}`;
  const signature = await signHmacSha256(input, getJwtSecret());

  return `${input}.${toBase64Url(signature)}`;
}

export async function verifyAccessToken(
  token: string
): Promise<VerifiedAccessToken | null> {
  if (!token || typeof token !== "string") return null;

  const segments = token.split(".");
  if (segments.length !== 3) return null;

  const [rawHeader, rawPayload, rawSignature] = segments;
  const header = parseJwtPart<JwtHeader>(rawHeader);
  const payload = parseJwtPart<JwtPayload>(rawPayload);
  const signature = fromBase64Url(rawSignature);

  if (!header || !payload || !signature) return null;
  if (header.alg !== "HS256") return null;

  const isSignatureValid = await verifyHmacSha256(
    `${rawHeader}.${rawPayload}`,
    signature,
    getJwtSecret()
  );
  if (!isSignatureValid) return null;

  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== "number" || now >= payload.exp) return null;
  if (typeof payload.nbf === "number" && now < payload.nbf) return null;
  if (payload.iss !== JWT_ISSUER) return null;
  if (!hasValidAudience(payload.aud)) return null;

  if (typeof payload.sub !== "string" || payload.sub.trim() === "") return null;
  if (!isUserRole(payload.role)) return null;

  return {
    userId: payload.sub,
    role: payload.role,
    exp: payload.exp,
  };
}
