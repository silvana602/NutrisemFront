import { NextRequest, NextResponse } from "next/server";
import { db, seedOnce, getUserByCI } from "@/mocks/db";
import { delay } from "@/mocks/utils";
import type { AuthResponse } from "@/types/auth";

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

  // Si el usuario es healthcare, agregar su info de healthcare
  let healthcareData: AuthResponse["Healthcare"] = undefined;
  if (user.role === "healthcare") {
    healthcareData = db.Healthcares.find((h) => h.userId === user.userId);
  }

  const accessToken = `mock-access-${user.userId}-${Date.now()}`;

  const res = NextResponse.json<AuthResponse>({
    accessToken,
    user,
    Healthcare: healthcareData,
  });

  res.cookies.set("refreshToken", `mock-refresh-${user.userId}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return res;
}
