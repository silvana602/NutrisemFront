"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { getMenuByRole, type MenuSubItem } from "@/config/menus";
import Avatar from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import { useUserSettings } from "@/features/settings/hooks/useUserSettings";
import { ROLE_VISIBILITY_UPDATED_EVENT } from "@/features/settings/utils/roleVisibility.utils";

function isMenuItemActive(pathname: string, item: Pick<MenuSubItem, "href" | "matchExact">) {
  if (item.matchExact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(item.href + "/");
}

export default function Sidebar() {
  const hydrated = useAuthStore((state) => state.hydrated);
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const activeRole = useAuthStore((state) => state.activeRole);
  const { fotoPerfil: profilePhoto } = useUserSettings(user?.userId ?? null);
  const [openedParentItem, setOpenedParentItem] = useState<string | null>(null);
  const [hoveredParentItem, setHoveredParentItem] = useState<string | null>(null);
  const [, setVisibilityVersion] = useState(0);

  useEffect(() => {
    const handleVisibilityUpdated = () => {
      setVisibilityVersion((version) => version + 1);
    };

    window.addEventListener(ROLE_VISIBILITY_UPDATED_EVENT, handleVisibilityUpdated);
    return () => {
      window.removeEventListener(ROLE_VISIBILITY_UPDATED_EVENT, handleVisibilityUpdated);
    };
  }, []);

  if (!hydrated || !user) return null;

  const menuItems = getMenuByRole(activeRole ?? user.role);

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
          const hasChildren = Boolean(item.children?.length);
          const isCurrentItemActive = isMenuItemActive(pathname, item);
          const isAnyChildActive = Boolean(
            item.children?.some((child) => isMenuItemActive(pathname, child))
          );
          const isActive = isCurrentItemActive || isAnyChildActive;
          const isExpanded =
            hasChildren &&
            (isAnyChildActive || openedParentItem === item.href || hoveredParentItem === item.href);

          if (hasChildren && item.children) {
            const submenuId = `sidebar-submenu-${item.href.replaceAll("/", "-")}`;

            return (
              <div
                key={item.href}
                onMouseEnter={() => setHoveredParentItem(item.href)}
                onMouseLeave={() =>
                  setHoveredParentItem((currentItem) =>
                    currentItem === item.href ? null : currentItem
                  )
                }
              >
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  aria-controls={submenuId}
                  onClick={() =>
                    setOpenedParentItem((currentItem) =>
                      currentItem === item.href ? null : item.href
                    )
                  }
                  className={cn(
                    "nutri-menu-button group relative mx-2 my-1 flex w-[calc(100%-1rem)] items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all duration-200",
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

                  <ChevronDown
                    size={16}
                    className={cn("transition-transform duration-200", isExpanded && "rotate-180")}
                  />

                  {isActive ? (
                    <span className="absolute inset-y-1.5 left-0.5 w-0.5 rounded-full bg-white/80" />
                  ) : null}
                </button>

                {isExpanded ? (
                  <div id={submenuId} className="mx-2 mt-0.5 space-y-1 pb-1 pl-12 pr-2">
                    {item.children.map((child) => {
                      const isChildActive = isMenuItemActive(pathname, child);

                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "group/submenu flex items-center gap-2 rounded-lg px-2.5 py-2 text-[12px] font-semibold transition-all duration-200",
                            isChildActive
                              ? "bg-[linear-gradient(135deg,#172A3A_0%,#567C8D_100%)] text-nutri-white shadow-[0_8px_18px_rgba(18,33,46,0.2)]"
                              : "text-nutri-dark-grey/85 hover:bg-white/80 hover:text-nutri-primary"
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full transition-colors",
                              isChildActive
                                ? "bg-white"
                                : "bg-nutri-secondary/50 group-hover/submenu:bg-nutri-primary"
                            )}
                          />
                          <span className="flex-1">{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          }

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
