// Utilidades generales para Nutrisem

// Pausa artificial para simular llamadas a BD o API
export const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

type GlobalUidState = typeof globalThis & {
  __NUTRISEM_UID__?: number;
};

const G = globalThis as GlobalUidState;

// Inicializar contador global para IDs del proyecto Nutrisem
if (typeof G.__NUTRISEM_UID__ !== "number") G.__NUTRISEM_UID__ = 0;

/** Reinicia el contador (util en desarrollo para resetear mocks) */
export function resetUid(n = 0) {
  G.__NUTRISEM_UID__ = n;
}

/** Generador de IDs unicos para Nutrisem */
export const uid = (prefix = "id") => `${prefix}_${++G.__NUTRISEM_UID__!}`;

/** Respuesta JSON estandar */
export function json<T>(data: T, init?: ResponseInit) {
  return Response.json(data, init);
}

/** Normaliza textos para URLs, claves, slugs, etc. */
export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
