import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "Registro no implementado en este entorno" },
    { status: 501 }
  );
}
