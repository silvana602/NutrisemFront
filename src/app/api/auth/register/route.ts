import { NextResponse } from "next/server";

export async function POST() {
  try {
    return NextResponse.json(
      { message: "Registro no implementado en este entorno" },
      { status: 501 }
    );
  } catch (error: unknown) {
    console.error("POST /api/auth/register error:", error);

    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
