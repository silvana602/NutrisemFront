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
    <header className="sticky top-0 z-30 border-b border-nutri-light-grey bg-nutri-white/95 shadow-sm backdrop-blur">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* LOGO */}
          <div className="flex items-center gap-2">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-nutri-primary text-xl font-bold text-nutri-white"
            >
              N
            </div>
            <span className="text-2xl font-bold text-nutri-primary">
              Nutrisem
            </span>
          </div>

          {/* TOGGLE MÓVIL */}
          <div className="ml-auto md:hidden">
            <MobileToggle
              ref={mobileBtnRef}
              open={mobile.open}
              onToggle={mobile.onToggle}
              menuId="navbar-mobile-menu"
            />
          </div>

          {user ? (
            <UserMenu />
          ) : (
            <>
            {/* ARREGLAR A FUTURO */}
              <Button variant="outline">
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
