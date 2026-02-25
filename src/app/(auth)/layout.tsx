import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Acceso | Nutrisem",
  description: "Acceso a Nutrisem.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-[calc(100dvh-var(--nutri-navbar-height)-var(--nutri-footer-height))] w-full place-items-center px-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
