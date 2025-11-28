// src/lib/fetcher.ts

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface FetcherOptions {
    method?: HttpMethod;
    body?: any;
    token?: string | null;      // Para autenticación
    headers?: Record<string, string>;
    noJson?: boolean;            // Por si se necesita archivo o texto
}

export async function fetcher<T = any>(
    url: string,
    options: FetcherOptions = {}
): Promise<T> {

    const { method = "GET", body, token, headers = {}, noJson = false } = options;

    const finalHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...headers,
    };

    if (token) {
        finalHeaders["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        method,
        headers: finalHeaders,
        body: body ? JSON.stringify(body) : undefined,
    });

    // --- Manejo de errores universales ---
    if (!response.ok) {
        let errorMessage = "Error desconocido";

        try {
            const errorBody = await response.json();
            errorMessage = errorBody.message || errorBody.error || errorMessage;
        } catch {
            errorMessage = response.statusText;
        }

        throw new Error(errorMessage);
    }

    if (noJson) return (await response.text()) as any;

    return (await response.json()) as T;
}
