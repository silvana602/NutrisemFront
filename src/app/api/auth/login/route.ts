import { NextRequest, NextResponse } from "next/server";
import { db, seedOnce, getUserByCI } from "@/mocks/db";
import { delay } from "@/mocks/utils";
import { UserRole } from "@/types";
import type { Clinician } from "@/types/clinician";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_TTL_SECONDS,
} from "@/lib/auth/constants";
import { sanitizeUser } from "@/lib/auth/sanitizeUser";
import { createAccessToken } from "@/lib/auth/token";

seedOnce();

type LoginField = "ci" | "password";

type LoginErrorBody = {
  message: string;
  field?: LoginField;
  fieldErrors?: Partial<Record<LoginField, string>>;
};

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
          password: "La contraseña es obligatoria",
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
        message: "La contraseña es obligatoria",
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
        message: "La contraseña es incorrecta",
        field: "password",
      };

      return NextResponse.json(body, { status: 401 });
    }

    let clinicianData: Clinician | null = null;
    if (user.role === UserRole.clinician) {
      clinicianData = db.clinicians.find((h) => h.userId === user.userId) ?? null;
    }

    const accessToken = await createAccessToken(user.userId, user.role);

    const res = NextResponse.json({
      user: sanitizeUser(user),
      clinician: clinicianData ?? null,
    });

    const isProd = process.env.NODE_ENV === "production";

    res.cookies.set(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      maxAge: ACCESS_TOKEN_TTL_SECONDS,
      path: "/",
    });

    res.cookies.set(REFRESH_TOKEN_COOKIE_NAME, `mock-refresh-${user.userId}`, {
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
