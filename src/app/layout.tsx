import type { Metadata } from "next";
import "@/app/globals.css";

import AppSessionBootstrap from "@/components/session/AppSessionBootstrap";
import { Navbar } from "@/components/layout/navbar/Navbar";
import { Footer } from "@/components/layout/footer/Footer";

export const metadata: Metadata = {
  title: { default: "Nutrisem", template: "%s | Nutrisem" },
  description: "Sistema de monitoreo nutricional infantil para CECASEM",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" data-theme="light" suppressHydrationWarning>
      <body>
        {/* 1. Anti-FOUC */}
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

        {/* 2. Inicialización de sesión para Zustand */}
        <AppSessionBootstrap />

        {/* 
          3. Navbar principal
          Se oculta automáticamente en /login y /register porque
          esos pages usan AuthLayout (que YA tiene otro navbar).
        */}
        <Navbar />

        {/* 4. Área principal */}
        <main className="min-h-screen w-full bg-nutri-off-white">
          {children}
        </main>

        {/* 5. Footer global */}
        <Footer />
      </body>
    </html>
  );
}
