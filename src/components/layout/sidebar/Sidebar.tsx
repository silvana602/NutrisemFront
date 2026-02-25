"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { getMenuByRole } from "@/config/menus";
import Avatar from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import { useUserSettings } from "@/features/settings/hooks/useUserSettings";

export default function Sidebar() {
  const hydrated = useAuthStore((state) => state.hydrated);
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  if (!hydrated || !user) return null;

  const menuItems = getMenuByRole(user.role);
  const { fotoPerfil: profilePhoto } = useUserSettings(user.userId);

  return (
    <aside
      className={cn(
        "hidden w-64 shrink-0 flex-col border-r border-white/60 bg-[linear-gradient(175deg,rgba(251,249,241,0.96)_0%,rgba(245,239,235,0.9)_68%,rgba(231,233,227,0.88)_100%)] shadow-[0_16px_30px_rgba(18,33,46,0.12)] lg:fixed lg:left-0 lg:top-[var(--nutri-navbar-height)] lg:bottom-0 lg:z-10 lg:flex lg:overflow-y-auto"
      )}
    >
      <div className="px-3 pt-3">
        <div className="rounded-xl border border-nutri-light-grey/80 bg-white/75 px-3 py-3.5 shadow-[0_10px_22px_rgba(18,33,46,0.1)]">
          <div className="flex flex-col items-center text-center">
            <div className="mb-2">
              <Avatar name={`${user.firstName} ${user.lastName}`} src={profilePhoto} size={72} />
            </div>
            <p className="truncate text-[13px] font-semibold text-nutri-dark-grey">
              {user.firstName} {user.lastName}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 px-3">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-nutri-secondary/35 to-transparent" />
      </div>

      <div className="px-3 pt-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-nutri-dark-grey/70">
          Navegación
        </p>
      </div>

      <nav className="mt-1.5 pb-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.matchExact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "nutri-menu-button group relative mx-2 my-1 flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all duration-200",
                isActive
                  ? "nutri-menu-button-active bg-[linear-gradient(135deg,#172A3A_0%,#567C8D_100%)] text-nutri-white shadow-[0_12px_24px_rgba(18,33,46,0.24)]"
                  : "nutri-menu-button-idle text-nutri-dark-grey hover:-translate-y-0.5 hover:bg-white/80 hover:shadow-[0_8px_18px_rgba(18,33,46,0.08)]"
              )}
            >
              <span
                className={cn(
                  "nutri-menu-button-icon inline-flex h-8 w-8 items-center justify-center rounded-lg border text-inherit transition-colors",
                  isActive
                    ? "nutri-menu-button-icon-active border-white/25 bg-white/15"
                    : "nutri-menu-button-icon-idle border-nutri-light-grey bg-white text-nutri-primary group-hover:border-nutri-secondary/40"
                )}
              >
                <Icon size={17} />
              </span>

              <span className="flex-1 truncate text-[13px] font-semibold">{item.label}</span>

              {item.badge ? (
                <span
                  className={cn(
                    "inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-nutri-secondary/15 text-nutri-primary"
                  )}
                >
                  {item.badge}
                </span>
              ) : null}

              {isActive ? (
                <span className="absolute inset-y-1.5 left-0.5 w-0.5 rounded-full bg-white/80" />
              ) : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
