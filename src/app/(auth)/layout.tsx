import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Acceso | Nutrisem",
  description: "Acceso a Nutrisem.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative grid min-h-[calc(100dvh-var(--nutri-navbar-height)-var(--nutri-footer-height))] w-full place-items-center overflow-hidden bg-[linear-gradient(120deg,rgba(245,239,235,0.95)_0%,rgba(251,249,241,0.9)_52%,rgba(231,233,227,0.82)_100%)] px-4 py-8">
      <div className="pointer-events-none absolute -left-24 top-8 h-48 w-48 rounded-full bg-nutri-secondary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-56 w-56 rounded-full bg-nutri-primary/15 blur-3xl" />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
