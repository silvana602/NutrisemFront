import type { Metadata } from "next";
import "@/app/globals.css";
import { isAuthenticatedServer } from "@/lib/auth/server";
import { redirect } from "next/navigation";

import { colors } from "@/lib/colors";

export const metadata: Metadata = {
  title: { default: "Acceso", template: "%s | Educasem" },
  description: "Inicia sesión o crea tu cuenta para acceder a Educasem",
};

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Si ya hay sesión, redirige al dashboard
  if (await isAuthenticatedServer()) redirect("/dashboard");

  return (
    <header className="shadow-md bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* LOGO */}
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: colors.primary }}
            >
              N
            </div>
            <span
              className="text-2xl font-bold"
              style={{ color: colors.primary }}
            >
              Nutrisem
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
