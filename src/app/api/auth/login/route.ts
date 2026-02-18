import { NextRequest, NextResponse } from "next/server";
import { sign } from "jsonwebtoken";
import { db, seedOnce, getUserByCI } from "@/mocks/db";
import { delay } from "@/mocks/utils";
import type { AuthResponse } from "@/types/auth";
import { UserRole } from "@/types";

seedOnce();

type LoginField = "ci" | "password";

type LoginErrorBody = {
  message: string;
  field?: LoginField;
  fieldErrors?: Partial<Record<LoginField, string>>;
};

const ACCESS_TOKEN_TTL_SECONDS = 60 * 60;
const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

function getJwtSecret(): string {
  const configuredSecret = process.env.JWT_SECRET;

  if (configuredSecret) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV !== "production") {
    return "nutrisem-dev-only-secret";
  }

  throw new Error("JWT_SECRET no configurado en produccion");
}

function createAccessToken(userId: string, role: UserRole): string {
  return sign({ role }, getJwtSecret(), {
    subject: userId,
    expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    issuer: "nutrisem",
    audience: "nutrisem-web",
  });
}

export async function POST(req: NextRequest) {
  try {
    await delay();

    const { ci, password } = await req.json();

    const normalizedCi = typeof ci === "string" ? ci.trim() : "";
    const normalizedPassword = typeof password === "string" ? password : "";

    if (!normalizedCi && !normalizedPassword) {
      const body: LoginErrorBody = {
        message: "Debe completar los campos obligatorios",
        fieldErrors: {
          ci: "La CI es obligatoria",
          password: "La contrasena es obligatoria",
        },
      };

      return NextResponse.json(body, { status: 400 });
    }

    if (!normalizedCi) {
      const body: LoginErrorBody = {
        message: "La CI es obligatoria",
        field: "ci",
      };

      return NextResponse.json(body, { status: 400 });
    }

    if (!normalizedPassword) {
      const body: LoginErrorBody = {
        message: "La contrasena es obligatoria",
        field: "password",
      };

      return NextResponse.json(body, { status: 400 });
    }

    const user = getUserByCI(normalizedCi);
    if (!user) {
      const passwordMatchesAnyUser = Array.from(db.passwords.values()).some(
        (savedPassword) => savedPassword === normalizedPassword
      );

      if (!passwordMatchesAnyUser) {
        const body: LoginErrorBody = {
          message: "Credenciales incorrectas",
        };

        return NextResponse.json(body, { status: 401 });
      }

      const body: LoginErrorBody = {
        message: "La CI no existe en el sistema",
        field: "ci",
      };

      return NextResponse.json(body, { status: 401 });
    }

    const savedPassword = db.passwords.get(user.userId);
    if (!savedPassword || savedPassword !== normalizedPassword) {
      const body: LoginErrorBody = {
        message: "La contrasena es incorrecta",
        field: "password",
      };

      return NextResponse.json(body, { status: 401 });
    }

    let clinicianData: AuthResponse["clinician"] = undefined;
    if (user.role === UserRole.clinician) {
      clinicianData = db.clinicians.find((h) => h.userId === user.userId);
    }

    const accessToken = createAccessToken(user.userId, user.role);

    const res = NextResponse.json<AuthResponse>({
      accessToken,
      user,
      clinician: clinicianData,
    });

    const isProd = process.env.NODE_ENV === "production";

    res.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      maxAge: ACCESS_TOKEN_TTL_SECONDS,
      path: "/",
    });

    res.cookies.set("refreshToken", `mock-refresh-${user.userId}`, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      maxAge: REFRESH_TOKEN_TTL_SECONDS,
      path: "/",
    });

    return res;
  } catch (error: unknown) {
    console.error("POST /api/auth/login error:", error);

    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
