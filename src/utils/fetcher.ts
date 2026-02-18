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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export class FetcherError<TPayload = unknown> extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
  readonly payload: TPayload | null;

  constructor(params: {
    message: string;
    status: number;
    statusText: string;
    url: string;
    payload: TPayload | null;
  }) {
    super(params.message);
    this.name = "FetcherError";
    this.status = params.status;
    this.statusText = params.statusText;
    this.url = params.url;
    this.payload = params.payload;
  }
}

export function isFetcherError(error: unknown): error is FetcherError {
  return error instanceof FetcherError;
}

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
    let errorMessage = response.statusText || "Error desconocido";
    let errorPayload: unknown = null;

    try {
      const contentType = response.headers.get("content-type") ?? "";

      if (contentType.includes("application/json")) {
        const parsedBody = (await response.json()) as unknown;
        errorPayload = parsedBody;

        if (isRecord(parsedBody)) {
          const body = parsedBody as ErrorPayload;
          errorMessage = body.message || body.error || errorMessage;
        }
      } else {
        const textBody = await response.text();
        errorPayload = textBody || null;
        errorMessage = textBody || errorMessage;
      }
    } catch {
      // Si falla el parseo del body, conservamos statusText.
    }

    throw new FetcherError({
      message: errorMessage,
      status: response.status,
      statusText: response.statusText,
      url,
      payload: errorPayload,
    });
  }

  if (noJson) {
    return (await response.text()) as T;
  }

  if (response.status === 204 || response.status === 205) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return (await response.text()) as T;
  }

  return (await response.json()) as T;
}
