import { NextRequest, NextResponse } from "next/server";
import { db, seedOnce, getUserByCI } from "@/mocks/db";
import { delay } from "@/mocks/utils";
import type { AuthResponse } from "@/types/auth";
import { UserRole } from "@/types";

seedOnce();

export async function POST(req: NextRequest) {
  await delay();

  const { ci, password } = await req.json();

  if (!ci || !password) {
    return NextResponse.json({ message: "Datos inválidos" }, { status: 400 });
  }

  const user = getUserByCI(ci);
  if (!user) {
    return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 });
  }

  const savedPassword = db.passwords.get(user.userId);
  if (!savedPassword || savedPassword !== password) {
    return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 });
  }

  // Si el usuario es clinician, agregar su info de clinician
  let clinicianData: AuthResponse["clinician"] = undefined;
  if (user.role === UserRole.clinician) {
    clinicianData = db.clinicians.find((h) => h.userId === user.userId);
  }

  const accessToken = `mock-access-${user.userId}-${Date.now()}`;

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
    maxAge: 60 * 60,
    path: "/",
  });

  res.cookies.set("refreshToken", `mock-refresh-${user.userId}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return res;
}
