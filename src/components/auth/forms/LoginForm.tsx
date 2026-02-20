"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLoginMutation } from "@/hooks/auth/useLoginMutation";
import {
  useLoginFormValidation,
  type LoginField,
} from "@/hooks/auth/useLoginFormValidation";
import {
  clearRememberedCi,
  readRememberedCi,
  writeRememberedCi,
} from "@/lib/auth/sessionStorageAdapter";
import { resolveDashboardPathByRole } from "@/lib/auth/roleRouting";
import { useAuthStore } from "@/store/useAuthStore";

export function LoginForm() {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const { loading, login } = useLoginMutation();
  const {
    errors,
    touched,
    setTouched,
    clearAllErrors,
    clearFormError,
    validateField,
    validateForm,
    applyApiErrors,
    setFormError,
  } = useLoginFormValidation();

  const [ci, setCi] = useState(() => readRememberedCi());
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberCi, setRememberCi] = useState(() => readRememberedCi() !== "");

  useEffect(() => {
    if (!currentUser) return;
    router.replace(resolveDashboardPathByRole(currentUser.role));
  }, [currentUser, router]);

  const handleFieldBlur = (field: LoginField, value: string) => {
    setTouched((previous) => ({
      ...previous,
      [field]: true,
    }));
    validateField(field, value);
  };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    clearAllErrors();

    if (!validateForm({ ci, password })) {
      return;
    }

    const normalizedCi = ci.trim();
    const result = await login({
      ci: normalizedCi,
      password,
    });

    if (!result.ok) {
      applyApiErrors(result.fieldErrors);

      if (result.formError && Object.keys(result.fieldErrors).length === 0) {
        setFormError(result.formError);
      }
      return;
    }

    setSession({
      user: result.data.user,
      clinician: result.data.clinician ?? null,
    });

    if (rememberCi) {
      writeRememberedCi(normalizedCi);
    } else {
      clearRememberedCi();
    }

    router.push(resolveDashboardPathByRole(result.data.user.role));
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
          onChange={(event) => {
            const value = event.target.value;
            setCi(value);

            if (touched.ci) {
              validateField("ci", value);
            }

            if (errors.form) {
              clearFormError();
            }
          }}
          onBlur={() => handleFieldBlur("ci", ci)}
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
            onChange={(event) => {
              const value = event.target.value;
              setPassword(value);

              if (touched.password) {
                validateField("password", value);
              }

              if (errors.form) {
                clearFormError();
              }
            }}
            onBlur={() => handleFieldBlur("password", password)}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "login-password-error" : undefined}
            className="nutri-input pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((previous) => !previous)}
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
          checked={rememberCi}
          onChange={(event) => setRememberCi(event.target.checked)}
          className="h-4 w-4 cursor-pointer rounded border-nutri-light-grey accent-nutri-primary"
        />
        <span>Recordar CI en esta sesion</span>
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
