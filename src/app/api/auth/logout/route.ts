import { NextResponse } from "next/server";

export async function POST() {
  try {
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
  } catch (error: unknown) {
    console.error("POST /api/auth/logout error:", error);

    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
