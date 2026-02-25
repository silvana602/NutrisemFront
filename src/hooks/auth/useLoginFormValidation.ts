"use client";

import { useState } from "react";
import { validateDocumentNumber, validateRequired } from "@/utils/validators";

export type LoginField = "ci" | "password";
export type LoginErrors = Partial<Record<LoginField | "form", string>>;
export type LoginTouched = Partial<Record<LoginField, boolean>>;

function validateLoginField(field: LoginField, value: string) {
  if (field === "ci") {
    const requiredError = validateRequired(value, "La CI");
    if (requiredError) return requiredError;
    return validateDocumentNumber(value);
  }

  return validateRequired(value, "La contraseña");
}

export function useLoginFormValidation() {
  const [errors, setErrors] = useState<LoginErrors>({});
  const [touched, setTouched] = useState<LoginTouched>({});

  const clearFormError = () => {
    setErrors((previous) => ({
      ...previous,
      form: undefined,
    }));
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  const validateField = (field: LoginField, value: string) => {
    const fieldError = validateLoginField(field, value);

    setErrors((previous) => ({
      ...previous,
      [field]: fieldError ?? undefined,
    }));
  };

  const validateForm = ({ ci, password }: { ci: string; password: string }) => {
    const ciError = validateLoginField("ci", ci);
    const passwordError = validateLoginField("password", password);

    setTouched({ ci: true, password: true });
    setErrors((previous) => ({
      ...previous,
      ci: ciError ?? undefined,
      password: passwordError ?? undefined,
      form: undefined,
    }));

    return !ciError && !passwordError;
  };

  const applyApiErrors = (fieldErrors: Partial<Record<LoginField, string>>) => {
    if (Object.keys(fieldErrors).length === 0) return;

    setTouched({ ci: true, password: true });
    setErrors((previous) => ({
      ...previous,
      form: undefined,
      ...fieldErrors,
    }));
  };

  const setFormError = (message: string) => {
    setErrors((previous) => ({
      ...previous,
      form: message,
    }));
  };

  return {
    errors,
    touched,
    setTouched,
    clearAllErrors,
    clearFormError,
    validateField,
    validateForm,
    applyApiErrors,
    setFormError,
  };
}
