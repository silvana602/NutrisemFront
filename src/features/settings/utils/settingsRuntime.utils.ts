import type {
  IdiomaInterfaz,
  ModoVisual,
  UserSettingsStorage,
} from "../types/settings.types";

function resolveVisualMode(mode: ModoVisual): Exclude<ModoVisual, "sistema"> {
  if (mode !== "sistema") return mode;

  if (typeof window === "undefined") {
    return "claro";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "oscuro" : "claro";
}

export function applyVisualMode(mode: ModoVisual): void {
  if (typeof window === "undefined") return;

  const root = window.document.documentElement;
  root.setAttribute("data-nutri-modo", resolveVisualMode(mode));
  root.setAttribute("data-nutri-modo-preferencia", mode);
}

export function applyInterfaceLanguage(idioma: IdiomaInterfaz): void {
  if (typeof window === "undefined") return;

  window.document.documentElement.setAttribute("lang", idioma === "en" ? "en" : "es");
}

export function applyInterfaceSettings(settings: UserSettingsStorage): void {
  applyVisualMode(settings.preferencias.modoVisual);
  applyInterfaceLanguage(settings.preferencias.idioma);
}
