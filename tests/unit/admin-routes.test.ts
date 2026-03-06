import { describe, expect, it } from "vitest";
import { buildAdminDoctorProfilePath } from "@/lib/routes/admin";

describe("admin routes", () => {
  it("retorna ruta base cuando no hay clinicianId", () => {
    expect(buildAdminDoctorProfilePath()).toBe("/dashboard/admin/users/medicos");
  });

  it("construye ruta dinámica para perfil de médico", () => {
    expect(buildAdminDoctorProfilePath("cli_123")).toBe(
      "/dashboard/admin/users/medicos/cli_123"
    );
  });

  it("omite segmentos vacíos", () => {
    expect(buildAdminDoctorProfilePath("   ")).toBe("/dashboard/admin/users/medicos");
  });
});
