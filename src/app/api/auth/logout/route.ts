import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  const isProd = process.env.NODE_ENV === "production";

  res.cookies.set("accessToken", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    expires: new Date(0),
    path: "/",
  });

  res.cookies.set("refreshToken", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    expires: new Date(0),
    path: "/",
  });

  return res;
}
