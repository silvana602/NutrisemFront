import { NextRequest, NextResponse } from "next/server";
import { db, getUserById, seedOnce } from "@/mocks/db";
import { UserRole } from "@/types/user";
import { ACCESS_TOKEN_COOKIE_NAME } from "@/lib/auth/constants";
import { sanitizeUser } from "@/lib/auth/sanitizeUser";
import { verifyAccessToken } from "@/lib/auth/token";

seedOnce();

export async function GET(req: NextRequest) {
  try {
    const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value;

    if (!accessToken) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    const verifiedToken = await verifyAccessToken(accessToken);
    if (!verifiedToken) {
      const response = NextResponse.json(
        { message: "Sesión inválida" },
        { status: 401 }
      );
      response.cookies.delete(ACCESS_TOKEN_COOKIE_NAME);
      return response;
    }

    const user = getUserById(verifiedToken.userId);
    if (!user || user.role !== verifiedToken.role) {
      const response = NextResponse.json(
        { message: "Sesión no encontrada" },
        { status: 401 }
      );
      response.cookies.delete(ACCESS_TOKEN_COOKIE_NAME);
      return response;
    }

    const clinician =
      user.role === UserRole.clinician
        ? db.clinicians.find((item) => item.userId === user.userId) ?? null
        : null;

    return NextResponse.json({
      user: sanitizeUser(user),
      clinician,
    });
  } catch (error: unknown) {
    console.error("GET /api/auth/me error:", error);

    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
