"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Backdrop } from "@/components/ui/Backdrop";
import MobileToggle from "@/components/layout/sidebar/MobileToggle";
import UserMenu from "@/components/layout/sidebar/UserMenu";
import { useDisclosure } from "@/hooks/useDisclosure";
import { useGlobalDismiss } from "@/hooks/useGlobalDismiss";
// import AuthButtons from "@/components/layout/navbar/AuthButtons";
// import { Link } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

function buildNext(pathname: string | null, qs: string): string | "" {
  if (!pathname) return "";
  if (pathname === "/login" || pathname === "/register") return "";
  const full = qs ? `${pathname}?${qs}` : pathname;
  return full;
}

export const Navbar = () => {
  const pathname = usePathname();

  // ⬅ AHORA USAMOS ZUSTAND, NO REDUX
  const user = useAuthStore((s) => s.user);

  const nextFull = buildNext(pathname, "");
  const nextQuery = nextFull ? `?next=${encodeURIComponent(nextFull)}` : "";

  // Estados y refs
  const explore = useDisclosure(false);
  const mobile = useDisclosure(false);

  const exploreRef = useRef<HTMLDivElement | null>(null);
  const exploreBtnRef = useRef<HTMLButtonElement | null>(null);
  const mobileRef = useRef<HTMLDivElement | null>(null);
  const mobileBtnRef = useRef<HTMLButtonElement | null>(null);

  // Cierre global por click afuera y Escape
  useGlobalDismiss(
    [explore.onClose, mobile.onClose],
    [exploreRef, exploreBtnRef, mobileRef, mobileBtnRef]
  );

  return (
    <header className="sticky top-0 z-30 h-[var(--nutri-navbar-height)] border-b border-nutri-light-grey bg-nutri-white/95 shadow-sm backdrop-blur">
      <div className="container mx-auto flex h-full px-3 sm:px-4">
        <div className="flex w-full items-center justify-between">
          {/* LOGO */}
          <Link
            href="/"
            aria-label="Ir a la pagina de bienvenida"
            className="flex min-w-0 items-center gap-2"
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-nutri-primary text-lg font-bold text-nutri-white sm:h-10 sm:w-10 sm:text-xl"
            >
              N
            </div>
            <span className="hidden truncate text-xl font-bold text-nutri-primary sm:inline sm:text-2xl">
              Nutrisem
            </span>
          </Link>

          {/* TOGGLE MÓVIL */}
          {user && (
            <div className="ml-auto md:hidden">
              <MobileToggle
                ref={mobileBtnRef}
                open={mobile.open}
                onToggle={mobile.onToggle}
                menuId="navbar-mobile-menu"
              />
            </div>
          )}

          {user ? (
            <UserMenu />
          ) : (
            <>
            {/* ARREGLAR A FUTURO */}
              <Button
                variant="outline"
                className="px-3 py-2 text-sm sm:px-5 sm:py-2.5"
              >
                <Link href={`/login${nextQuery}`}>
                  Iniciar sesión
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* BACKDROP */}
      <Backdrop show={mobile.open} onClick={mobile.onClose} mobileOnly />
    </header>
  );
};
