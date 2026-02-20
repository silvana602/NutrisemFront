import { describe, expect, it } from "vitest";
import { createAccessToken, verifyAccessToken } from "@/lib/auth/token";
import { UserRole } from "@/types/user";

describe("token", () => {
  it("genera y verifica access token valido", async () => {
    const token = await createAccessToken("usr_123", UserRole.clinician);
    const verified = await verifyAccessToken(token);

    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe("usr_123");
    expect(verified?.role).toBe(UserRole.clinician);
  });

  it("rechaza token manipulado", async () => {
    const token = await createAccessToken("usr_123", UserRole.admin);
    const [header, payload] = token.split(".");
    const tampered = `${header}.${payload}.firmaInvalida`;

    const verified = await verifyAccessToken(tampered);
    expect(verified).toBeNull();
  });
});
