// Utilidades generales para Nutrisem

// Pausa artificial para simular llamadas a BD o API
export const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const G = globalThis as any;

// Inicializar contador global para IDs del proyecto Nutrisem
if (typeof G.__NUTRISEM_UID__ !== "number") G.__NUTRISEM_UID__ = 0;

/** Reinicia el contador (útil en desarrollo para resetear mocks) */
export function resetUid(n = 0) {
    (globalThis as any).__NUTRISEM_UID__ = n;
}

/** Generador de IDs únicos para Nutrisem */
export const uid = (p = "id") =>
    `${p}_${++(globalThis as any).__NUTRISEM_UID__}`;

/** Respuesta JSON estándar */
export function json<T>(data: T, init?: ResponseInit) {
    return Response.json(data, init);
}

/** Normaliza textos para URLs, claves, slugs, etc. */
export function slugify(s: string) {
    return s
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")     // elimina tildes
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")         // reemplaza símbolos por "-"
        .replace(/(^-|-$)/g, "");            // limpia guiones sobrantes
}