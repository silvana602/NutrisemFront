"use client";

import { useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Backdrop } from "@/components/ui/Backdrop";
import MobileToggle from "@/components/layout/sidebar/MobileToggle";
import UserMenu from "@/components/layout/sidebar/UserMenu";
import { useDisclosure } from "@/hooks/useDisclosure";
import { useGlobalDismiss } from "@/hooks/useGlobalDismiss";
// import AuthButtons from "@/components/layout/navbar/AuthButtons";
import { colors } from "@/lib/colors";
// import { Link } from "lucide-react";
import Link from "next/link";

function buildNext(pathname: string | null, qs: string): string | "" {
  if (!pathname) return "";
  if (pathname === "/login" || pathname === "/register") return "";
  const full = qs ? `${pathname}?${qs}` : pathname;
  return full;
}

export const Navbar = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ⬅ AHORA USAMOS ZUSTAND, NO REDUX
  const user = useAuthStore((s) => s.user);

  const qs = searchParams.toString();
  const nextFull = buildNext(pathname, qs);
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
              <Link
                href={`/login${nextQuery}`}
                className="text-sm px-3 py-1 border border-nutri-primary text-primary font-semibold rounded-xl hover:bg-nutri-primary hover:text-nutri-off-white transition"
              >
                Iniciar sesión
              </Link>
            </>
          )}
        </div>
      </div>

      {/* BACKDROP */}
      <Backdrop show={mobile.open} onClick={mobile.onClose} mobileOnly />
    </header>
  );
};
