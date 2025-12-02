import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Acceso | Nutrisem",
  description: "Inicia sesión para acceder al sistema Nutrisem",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F0]">
      {/* MAIN — ocupa todo el espacio entre navbar y footer */}
      <main className="flex-1 flex items-center justify-center px-0 py-0">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
    </div>
  );
}
