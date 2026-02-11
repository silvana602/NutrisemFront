export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface FetcherOptions {
  method?: HttpMethod;
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
  noJson?: boolean;
}

type ErrorPayload = {
  message?: string;
  error?: string;
};

export async function fetcher<T = unknown>(
  url: string,
  options: FetcherOptions = {}
): Promise<T> {
  const {
    method = "GET",
    body,
    token,
    headers = {},
    noJson = false,
  } = options;

  const finalHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (token) {
    finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  const serializedBody =
    body === undefined
      ? undefined
      : typeof body === "string"
      ? body
      : JSON.stringify(body);

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    body: serializedBody,
  });

  if (!response.ok) {
    let errorMessage = "Error desconocido";

    try {
      const errorBody = (await response.json()) as ErrorPayload;
      errorMessage = errorBody.message || errorBody.error || errorMessage;
    } catch {
      errorMessage = response.statusText;
    }

    throw new Error(errorMessage);
  }

  if (noJson) {
    return (await response.text()) as T;
  }

  return (await response.json()) as T;
}
