"use client";

const REMEMBERED_CREDENTIALS_KEY = "nutrisem.rememberedCredentials";
const LEGACY_REMEMBERED_CI_KEY = "nutrisem.rememberedCi";

export type RememberedCredentials = {
  ci: string;
  password: string;
};

function isBrowser() {
  return typeof window !== "undefined";
}

function emptyCredentials(): RememberedCredentials {
  return {
    ci: "",
    password: "",
  };
}

function toRememberedCredentials(value: unknown): RememberedCredentials {
  if (typeof value !== "object" || value === null) {
    return emptyCredentials();
  }

  const ci = "ci" in value && typeof value.ci === "string" ? value.ci.trim() : "";
  const password =
    "password" in value && typeof value.password === "string"
      ? value.password
      : "";

  return {
    ci,
    password,
  };
}

export function readRememberedCredentials(): RememberedCredentials {
  if (!isBrowser()) return emptyCredentials();

  const rawCredentials = window.sessionStorage.getItem(REMEMBERED_CREDENTIALS_KEY);

  if (rawCredentials) {
    try {
      return toRememberedCredentials(JSON.parse(rawCredentials));
    } catch {
      return emptyCredentials();
    }
  }

  const legacyCi = window.sessionStorage.getItem(LEGACY_REMEMBERED_CI_KEY) ?? "";
  if (!legacyCi.trim()) return emptyCredentials();

  return {
    ci: legacyCi.trim(),
    password: "",
  };
}

export function writeRememberedCredentials(credentials: RememberedCredentials) {
  if (!isBrowser()) return;

  const normalizedCi = credentials.ci.trim();
  if (!normalizedCi || credentials.password.length === 0) {
    clearRememberedCredentials();
    return;
  }

  window.sessionStorage.setItem(
    REMEMBERED_CREDENTIALS_KEY,
    JSON.stringify({
      ci: normalizedCi,
      password: credentials.password,
    })
  );
  window.sessionStorage.removeItem(LEGACY_REMEMBERED_CI_KEY);
}

export function clearRememberedCredentials() {
  if (!isBrowser()) return;
  window.sessionStorage.removeItem(REMEMBERED_CREDENTIALS_KEY);
  window.sessionStorage.removeItem(LEGACY_REMEMBERED_CI_KEY);
}
