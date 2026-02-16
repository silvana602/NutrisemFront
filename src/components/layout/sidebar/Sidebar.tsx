"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { getMenuByRole } from "@/config/menus";
import Avatar from "@/components/ui/Avatar";

import { cn } from "@/lib/utils";

export default function Sidebar() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  if (!hydrated || !user) return null;

  const menuItems = getMenuByRole(user.role);

  return (
    <aside className="hidden min-h-screen w-72 flex-col border-r border-nutri-light-grey bg-nutri-white/95 shadow-sm lg:flex lg:flex-col lg:w-72">
      {/* USER SECTION */}
      <div className="flex flex-col items-center text-center py-6">
        <div className="mb-3">
          <Avatar name={`${user.firstName} ${user.lastName}`} size={100} />
        </div>
        <p className="truncate text-sm font-semibold text-nutri-dark-grey">
          {user.firstName} {user.lastName}
        </p>
      </div>

      {/* MENU */}
      <nav className="mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;

          // ✅ Solo activo si el pathname coincide exactamente o es subruta (opcional)
          const isActive = item.matchExact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "mx-3 my-1 flex items-center gap-3 rounded-xl px-6 py-3 transition-all duration-150",
                isActive
                  ? "bg-nutri-primary text-nutri-white shadow-sm"
                  : "text-nutri-dark-grey hover:bg-nutri-off-white"
              )}
            >
              <Icon size={18} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
