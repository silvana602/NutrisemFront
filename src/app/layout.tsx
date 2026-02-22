import type { Metadata } from "next";
import { Nunito_Sans, Sora } from "next/font/google";
import "@/app/globals.css";

import AppSessionBootstrap from "@/components/session/AppSessionBootstrap";
import { Navbar } from "@/components/layout/navbar/Navbar";
import { Footer } from "@/components/layout/footer/Footer";

const uiFont = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

const headingFont = Sora({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

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
    <html
      lang="es"
      data-theme="light"
      suppressHydrationWarning
      className={`${uiFont.variable} ${headingFont.variable}`}
    >
      <body className="min-h-dvh flex flex-col bg-nutri-off-white text-nutri-dark-grey">
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
        <main className="min-h-0 flex-1 w-full bg-nutri-off-white">
          {children}
        </main>

        {/* 5. Footer global */}
        <Footer />
      </body>
    </html>
  );
}
