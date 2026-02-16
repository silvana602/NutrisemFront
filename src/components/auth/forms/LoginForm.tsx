"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
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

type RememberedPasswords = Record<string, string>;

const REMEMBERED_PASSWORDS_KEY = "nutrisem.rememberedPasswords";
const LAST_REMEMBERED_CI_KEY = "nutrisem.lastRememberedCi";

function readRememberedPasswords(): RememberedPasswords {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(REMEMBERED_PASSWORDS_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};

    const remembered: RememberedPasswords = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (
        typeof key === "string" &&
        key.trim() !== "" &&
        typeof value === "string" &&
        value !== ""
      ) {
        remembered[key] = value;
      }
    }

    return remembered;
  } catch {
    return {};
  }
}

function writeRememberedPasswords(passwords: RememberedPasswords) {
  if (typeof window === "undefined") return;
  localStorage.setItem(REMEMBERED_PASSWORDS_KEY, JSON.stringify(passwords));
}

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
  const [showPassword, setShowPassword] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [touched, setTouched] = useState<Partial<Record<LoginField, boolean>>>(
    {}
  );

  useEffect(() => {
    const rememberedPasswords = readRememberedPasswords();
    const lastRememberedCi = localStorage.getItem(LAST_REMEMBERED_CI_KEY) ?? "";
    const rememberedPassword = rememberedPasswords[lastRememberedCi];

    if (!lastRememberedCi || !rememberedPassword) return;

    setCi(lastRememberedCi);
    setPassword(rememberedPassword);
    setRememberPassword(true);
  }, []);

  const applyRememberedPassword = (nextCi: string) => {
    const normalizedCi = nextCi.trim();
    if (!normalizedCi) return;

    const rememberedPassword = readRememberedPasswords()[normalizedCi];
    if (!rememberedPassword) return;

    setPassword(rememberedPassword);
    setRememberPassword(true);
    setErrors((prev) => ({
      ...prev,
      password: undefined,
      form: undefined,
    }));
  };

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
      const normalizedCi = ci.trim();
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ci: normalizedCi, password }),
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

      if (normalizedCi) {
        const rememberedPasswords = readRememberedPasswords();

        if (rememberPassword && password) {
          rememberedPasswords[normalizedCi] = password;
          writeRememberedPasswords(rememberedPasswords);
          localStorage.setItem(LAST_REMEMBERED_CI_KEY, normalizedCi);
        } else {
          if (normalizedCi in rememberedPasswords) {
            delete rememberedPasswords[normalizedCi];
            writeRememberedPasswords(rememberedPasswords);
          }

          if (localStorage.getItem(LAST_REMEMBERED_CI_KEY) === normalizedCi) {
            localStorage.removeItem(LAST_REMEMBERED_CI_KEY);
          }
        }
      }

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
            applyRememberedPassword(value);

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
        <div className="relative">
          <input
            id="login-password"
            name="password"
            type={showPassword ? "text" : "password"}
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
            className="nutri-input pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
            className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-md p-1 text-nutri-secondary transition-colors hover:text-nutri-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nutri-secondary/35"
          >
            <span className="sr-only">
              {showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
            </span>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p
            id="login-password-error"
            className="mt-1 text-xs font-medium text-nutri-secondary"
          >
            {errors.password}
          </p>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-nutri-dark-grey">
        <input
          type="checkbox"
          checked={rememberPassword}
          onChange={(e) => setRememberPassword(e.target.checked)}
          className="h-4 w-4 cursor-pointer rounded border-nutri-light-grey accent-nutri-primary"
        />
        <span>Recordar contrasena</span>
      </label>

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
