export const CONSULTATION_TABS = [
  { id: "anthropometric", label: "Datos Antropométricos" },
  { id: "clinical", label: "Datos Clínicos" },
  { id: "historical", label: "Datos Históricos" },
] as const;

export type ConsultationTabId = typeof CONSULTATION_TABS[number]["id"];
