import { beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { hardResetDb, seedOnce } from "@/mocks/db";
import { POST as login } from "@/app/api/auth/login/route";

function buildLoginRequest(body: { ci?: string; password?: string }) {
  return new NextRequest("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    hardResetDb();
    seedOnce();
  });

  it("retorna 200 y cookies de sesion con credenciales validas", async () => {
    const response = await login(
      buildLoginRequest({ ci: "1234567", password: "clinician" })
    );

    expect(response.status).toBe(200);

    const payload = (await response.json()) as {
      user?: { identityNumber?: string };
      clinician?: { userId?: string } | null;
    };
    expect(payload.user?.identityNumber).toBe("1234567");

    const setCookie = response.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("accessToken=");
    expect(setCookie.toLowerCase()).toContain("httponly");
  });

  it("retorna 401 cuando la contrasena es incorrecta", async () => {
    const response = await login(
      buildLoginRequest({ ci: "1234567", password: "incorrecta" })
    );

    expect(response.status).toBe(401);

    const payload = (await response.json()) as { field?: string };
    expect(payload.field).toBe("password");
  });
});
