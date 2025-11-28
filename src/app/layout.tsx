import type { Metadata } from "next";
import "@/app/globals.css";

import AppSessionBootstrap from "@/components/session/AppSessionBootstrap";
import { Navbar } from "@/components/layout/navbar/Navbar";
import { Footer } from "@/components/layout/footer/Footer";
// import DevBanner from "@/components/dev/DevBanner";

export const metadata: Metadata = {
  title: { default: "Nutrisem", template: "%s | Nutrisem" },
  description: "Sistema de monitoreo nutricional infantil para CECASEM",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDev = process.env.NODE_ENV !== "production";

  return (
    <html lang="es" data-theme="light" suppressHydrationWarning>
      <body>
        {/**
         * 1. Script anti-FOUC: mantiene el tema correcto antes de la hidratación
         */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  try {
    var saved = localStorage.getItem('theme');
    var theme = saved ? saved : 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
        `.trim(),
          }}
        />
        {/**
         * 3. Bootstrap de sesión para Zustand:
         *    - Al cargar la app, lee el token de cookies
         *    - Decodifica los datos del usuario
         *    - Hidrata useAuthStore automáticamente
         */}
        <AppSessionBootstrap />

        {/**
         * 4. Barra superior
         *    Esta barra es visible tanto en login como en dashboard
         */}
        <Navbar />

        {/**
         * 5. Layout principal
         */}
        <main className="min-h-screen w-full bg-nutri-off-white px-4 md:px-8 lg:px-25">
          {children}
        </main>

        {/**
         * 6. Footer general del sitio
         */}
        <Footer />

        {/**
         * 7. Banner de entorno DEV (solo en desarrollo)
         */}
        {/* {isDev && <DevBanner />} */}
      </body>
    </html>
  );
}
