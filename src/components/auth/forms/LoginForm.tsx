"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/Button";
import { validateDocumentNumber, validateRequired } from "@/utils/validators";

type LoginField = "ci" | "password";
type LoginErrors = Partial<Record<LoginField | "form", string>>;
type LoginApiError = {
  message?: string;
  field?: string;
  fieldErrors?: Partial<Record<LoginField, string>>;
};

function isLoginField(field: unknown): field is LoginField {
  return field === "ci" || field === "password";
}

function mapApiErrors(payload: LoginApiError | null): Partial<LoginErrors> {
  if (!payload) return {};

  const mapped: Partial<LoginErrors> = {};

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

function validateLoginField(field: LoginField, value: string): string | null {
  if (field === "ci") {
    const requiredError = validateRequired(value, "La CI");
    if (requiredError) return requiredError;
    return validateDocumentNumber(value);
  }

  return validateRequired(value, "La contrasena");
}

export function LoginForm() {
  const { setSession } = useAuthStore();
  const router = useRouter();

  const [ci, setCi] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [touched, setTouched] = useState<Partial<Record<LoginField, boolean>>>(
    {}
  );

  const setFieldError = (field: LoginField, value: string) => {
    const fieldError = validateLoginField(field, value);
    setErrors((prev) => ({
      ...prev,
      [field]: fieldError ?? undefined,
    }));
  };

  const validateForm = () => {
    const ciError = validateLoginField("ci", ci);
    const passwordError = validateLoginField("password", password);

    setTouched({ ci: true, password: true });
    setErrors((prev) => ({
      ...prev,
      ci: ciError ?? undefined,
      password: passwordError ?? undefined,
    }));

    return !ciError && !passwordError;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setErrors((prev) => ({
      ...prev,
      ci: undefined,
      password: undefined,
      form: undefined,
    }));
    if (!validateForm()) return;

    setLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api";
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ci: ci.trim(), password }),
      });

      if (!res.ok) {
        let payload: LoginApiError | null = null;

        try {
          payload = (await res.json()) as LoginApiError;
        } catch {
          payload = null;
        }

        const apiErrors = mapApiErrors(payload);
        if (Object.keys(apiErrors).length > 0) {
          setTouched({ ci: true, password: true });
          setErrors((prev) => ({
            ...prev,
            form: undefined,
            ...apiErrors,
          }));
          return;
        }

        throw new Error(payload?.message ?? "No se pudo iniciar sesion");
      }

      const data = await res.json();
      const sessionData = {
        accessToken: data.accessToken || "mock-token",
        user: data.user,
        clinician: data.clinician || null,
      };

      setSession(sessionData);
      localStorage.setItem("session", JSON.stringify(sessionData));
      localStorage.setItem("accessToken", sessionData.accessToken);

      const dashboardPath = (() => {
        switch (data.user.role) {
          case "admin":
            return "/dashboard/admin";
          case "clinician":
            return "/dashboard/clinician";
          case "patient":
            return "/dashboard/patient";
          default:
            return "/";
        }
      })();

      router.push(dashboardPath);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error inesperado";
      setErrors((prev) => ({ ...prev, form: message }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="login-ci" className="nutri-label">
          CI
        </label>
        <input
          id="login-ci"
          name="ci"
          type="text"
          value={ci}
          autoComplete="username"
          onChange={(e) => {
            const value = e.target.value;
            setCi(value);

            if (touched.ci) {
              setFieldError("ci", value);
            }

            if (errors.form) {
              setErrors((prev) => ({ ...prev, form: undefined }));
            }
          }}
          onBlur={() => {
            setTouched((prev) => ({ ...prev, ci: true }));
            setFieldError("ci", ci);
          }}
          aria-invalid={Boolean(errors.ci)}
          aria-describedby={errors.ci ? "login-ci-error" : undefined}
          maxLength={20}
          className="nutri-input"
          required
        />
        {errors.ci && (
          <p
            id="login-ci-error"
            className="mt-1 text-xs font-medium text-nutri-secondary"
          >
            {errors.ci}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="login-password" className="nutri-label">
          Contrasena
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          value={password}
          autoComplete="current-password"
          onChange={(e) => {
            const value = e.target.value;
            setPassword(value);

            if (touched.password) {
              setFieldError("password", value);
            }

            if (errors.form) {
              setErrors((prev) => ({ ...prev, form: undefined }));
            }
          }}
          onBlur={() => {
            setTouched((prev) => ({ ...prev, password: true }));
            setFieldError("password", password);
          }}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "login-password-error" : undefined}
          className="nutri-input"
          required
        />
        {errors.password && (
          <p
            id="login-password-error"
            className="mt-1 text-xs font-medium text-nutri-secondary"
          >
            {errors.password}
          </p>
        )}
      </div>

      {errors.form && (
        <p className="text-sm font-medium text-nutri-secondary">{errors.form}</p>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full justify-center"
      >
        {loading ? "Ingresando..." : "Iniciar sesion"}
      </Button>
    </form>
  );
}
