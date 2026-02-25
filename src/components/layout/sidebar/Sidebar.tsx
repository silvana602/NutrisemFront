"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { getMenuByRole } from "@/config/menus";
import Avatar from "@/components/ui/Avatar";
import { UserRole } from "@/types/user";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const hydrated = useAuthStore((state) => state.hydrated);
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  if (!hydrated || !user) return null;

  const menuItems = getMenuByRole(user.role);
  const isClinician = user.role === UserRole.clinician;

  return (
    <aside
      style={{ marginBottom: "calc(var(--nutri-footer-height) * -1)" }}
      className={cn(
        "hidden w-72 shrink-0 flex-col border-r border-nutri-light-grey bg-nutri-white/95 shadow-sm lg:sticky lg:top-[var(--nutri-navbar-height)] lg:flex lg:h-[calc(100dvh-var(--nutri-navbar-height))] lg:self-start lg:overflow-y-auto",
        isClinician &&
          "border-white/60 bg-[linear-gradient(175deg,rgba(251,249,241,0.96)_0%,rgba(245,239,235,0.9)_68%,rgba(231,233,227,0.88)_100%)] shadow-[0_16px_30px_rgba(18,33,46,0.12)]"
      )}
    >
      <div className="px-4 pt-5">
        <div className="rounded-2xl border border-nutri-light-grey/80 bg-white/75 px-4 py-5 shadow-[0_10px_22px_rgba(18,33,46,0.1)]">
          <div className="flex flex-col items-center text-center">
            <div className="mb-3">
              <Avatar name={`${user.firstName} ${user.lastName}`} size={92} />
            </div>
            <p className="truncate text-sm font-semibold text-nutri-dark-grey">
              {user.firstName} {user.lastName}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 px-4">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-nutri-secondary/35 to-transparent" />
      </div>

      <div className="px-4 pt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-nutri-dark-grey/70">
          Navegacion
        </p>
      </div>

      <nav className="mt-2 pb-5">
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
                "group relative mx-3 my-1.5 flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200",
                isActive
                  ? cn(
                      "bg-nutri-primary text-nutri-white shadow-[0_12px_24px_rgba(18,33,46,0.24)]",
                      isClinician && "bg-[linear-gradient(135deg,#172A3A_0%,#567C8D_100%)]"
                    )
                  : cn(
                      "text-nutri-dark-grey hover:bg-white/80 hover:shadow-[0_8px_18px_rgba(18,33,46,0.08)]",
                      isClinician && "hover:-translate-y-0.5"
                    )
              )}
            >
              <span
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-xl border text-inherit transition-colors",
                  isActive
                    ? "border-white/25 bg-white/15"
                    : "border-nutri-light-grey bg-white text-nutri-primary group-hover:border-nutri-secondary/40"
                )}
              >
                <Icon size={17} />
              </span>

              <span className="flex-1 text-sm font-semibold">{item.label}</span>

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
                <span className="absolute inset-y-2 left-1 w-1 rounded-full bg-white/80" />
              ) : null}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
