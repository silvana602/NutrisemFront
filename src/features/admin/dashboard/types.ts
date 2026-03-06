export type AdminDashboardKpiId =
  | "usuarios-activos"
  | "consultas-hoy"
  | "retencion-pacientes";

export type AdminDashboardKpi = {
  id: AdminDashboardKpiId;
  etiqueta: string;
  valor: string;
  descripcion: string;
};

export type HourlyActivityPoint = {
  hour: number;
  label: string;
  value: number;
};

export type AdminServiceId = "api" | "base-datos";

export type AdminServiceStatus = {
  id: AdminServiceId;
  nombre: string;
  operativo: boolean;
  descripcion: string;
};

export type AdminDashboardData = {
  kpis: AdminDashboardKpi[];
  hourlyActivity: HourlyActivityPoint[];
  peakActivityLabel: string;
  serviceStatuses: AdminServiceStatus[];
  updatedAt: Date;
};
