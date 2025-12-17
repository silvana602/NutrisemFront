"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useMenuByRole } from "@/hooks/useMenuByRol";
import { Role } from "@/types/user";
import Avatar from "../../ui/Avatar";

import { cn } from "@/lib/utils";
import { colors } from "@/lib/colors";

interface SidebarProps {
  role: Role;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const menuItems = useMenuByRole(role);

  if (!user) return null;

  return (
    <aside
      className={cn(
        "hidden lg:flex lg:flex-col lg:w-72 lg:min-h-screen lg:border-r",
        "bg-white"
      )}
      style={{
        borderColor: colors.lightGrey,
      }}
    >
      {/* USER SECTION */}
      <div className="flex flex-col items-center text-center py-6">
        <div className="mb-3">
          <Avatar name={`${user.firstName} ${user.lastName}`} size={100} />
        </div>

        <p
          className="truncate text-sm font-semibold"
          style={{ color: colors.darkGrey }}
        >
          {user.firstName} {user.lastName}
        </p>
      </div>

      {/* MENU */}
      <nav className="mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;

          /**
           * Nueva detección avanzada de ruta activa
           * Marca activo si la ruta comienza con el href real del item.
           */
          const isActive =
            pathname === item.href ||
            (pathname.startsWith(item.href + "/") &&
              item.href !== `/dashboard/${role}`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-6 py-3 mx-3 my-1 rounded-md transition-all duration-150",
                isActive
                  ? "shadow-sm text-white"
                  : "text-gray-700 hover:shadow-sm"
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
