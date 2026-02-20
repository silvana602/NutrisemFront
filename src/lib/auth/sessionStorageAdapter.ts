"use client";

const REMEMBERED_CI_KEY = "nutrisem.rememberedCi";

function isBrowser() {
  return typeof window !== "undefined";
}

export function readRememberedCi() {
  if (!isBrowser()) return "";
  return window.sessionStorage.getItem(REMEMBERED_CI_KEY) ?? "";
}

export function writeRememberedCi(ci: string) {
  if (!isBrowser()) return;
  const normalizedCi = ci.trim();
  if (!normalizedCi) return;
  window.sessionStorage.setItem(REMEMBERED_CI_KEY, normalizedCi);
}

export function clearRememberedCi() {
  if (!isBrowser()) return;
  window.sessionStorage.removeItem(REMEMBERED_CI_KEY);
}
