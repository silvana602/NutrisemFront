"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { getMenuByRole } from "@/hooks/useMenuByRol";
import Avatar from "@/components/ui/Avatar";

import { cn } from "@/lib/utils";
import { colors } from "@/lib/colors";

export default function Sidebar() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  if (!hydrated || !user) return null;

  const menuItems = getMenuByRole(user.role);

  return (
    <aside
      className="hidden lg:flex lg:flex-col lg:w-72 lg:min-h-screen lg:border-r"
      style={{
        borderColor: colors.lightGrey,
        backgroundColor: colors.white,
      }}
    >
      {/* USER SECTION */}
      <div className="flex flex-col items-center text-center py-6">
        <div className="mb-3">
          <Avatar name={`${user.firstName} ${user.lastName}`} size={100} />
        </div>
        <p className="truncate text-sm font-semibold" style={{ color: colors.darkGrey }}>
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
                "flex items-center gap-3 px-6 py-3 mx-3 my-1 rounded-md transition-all duration-150",
                isActive ? "shadow-sm text-white" : "hover:shadow-sm"
              )}
              style={{
                backgroundColor: isActive ? colors.primary : "transparent",
                color: isActive ? colors.white : colors.darkGrey,
              }}
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
