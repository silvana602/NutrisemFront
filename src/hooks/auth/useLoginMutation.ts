"use client";

import { useCallback, useState } from "react";
import type { Clinician } from "@/types/clinician";
import type { User } from "@/types/user";
import type { LoginField } from "@/hooks/auth/useLoginFormValidation";

type LoginApiError = {
  message?: string;
  field?: string;
  fieldErrors?: Partial<Record<LoginField, string>>;
};

type LoginSuccessResponse = {
  user: User;
  clinician?: Clinician | null;
};

type LoginMutationResult =
  | {
      ok: true;
      data: LoginSuccessResponse;
    }
  | {
      ok: false;
      formError?: string;
      fieldErrors: Partial<Record<LoginField, string>>;
    };

function isLoginField(field: unknown): field is LoginField {
  return field === "ci" || field === "password";
}

function mapApiErrors(payload: LoginApiError | null) {
  if (!payload) return {};

  const mapped: Partial<Record<LoginField, string>> = {};

  if (payload.fieldErrors) {
    for (const [field, message] of Object.entries(payload.fieldErrors)) {
      if (isLoginField(field) && typeof message === "string" && message) {
        mapped[field] = message;
      }
    }
  }

  if (
    isLoginField(payload.field) &&
    typeof payload.message === "string" &&
    payload.message
  ) {
    mapped[payload.field] = payload.message;
  }

  return mapped;
}

export function useLoginMutation() {
  const [loading, setLoading] = useState(false);

  const login = useCallback(
    async (payload: { ci: string; password: string }): Promise<LoginMutationResult> => {
      setLoading(true);

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api";
        const response = await fetch(`${baseUrl}/auth/login`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          let errorPayload: LoginApiError | null = null;

          try {
            errorPayload = (await response.json()) as LoginApiError;
          } catch {
            errorPayload = null;
          }

          return {
            ok: false,
            formError: errorPayload?.message ?? "No se pudo iniciar sesión",
            fieldErrors: mapApiErrors(errorPayload),
          };
        }

        const data = (await response.json()) as Partial<LoginSuccessResponse>;
        if (!data.user) {
          return {
            ok: false,
            formError: "Respuesta de login invalida",
            fieldErrors: {},
          };
        }

        return {
          ok: true,
          data: {
            user: data.user,
            clinician: data.clinician ?? null,
          },
        };
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Error inesperado";

        return {
          ok: false,
          formError: message,
          fieldErrors: {},
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    login,
  };
}
