"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useMenuByRole } from "@/hooks/useMenuByRol";
import { Role } from "@/types/user";
import Avatar from "../ui/Avatar";

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
    <>
      {/* Sidebar */}
      <aside
        className={cn(
          // Oculto en móvil
          "hidden",

          // Desktop: fijo, pegado al borde izquierdo, sin espacios
          "hidden lg:flex lg:flex-col lg:w-72 lg:min-h-screen lg:border-r",
          "bg-[var(--lightGrey)]"
        )}
        style={{
          backgroundColor: colors.white,
          borderColor: colors.lightGrey,
        }}
      >
        {/* User */}
        <div className="flex flex-col items-center text-center py-6">
          <h2
            className="text-2xl font-bold mb-3"
            style={{ color: colors.black }}
          >
            <Avatar name={user.firstName + " " + user.lastName} size={100} />
          </h2>
          <p
            className="truncate text-sm font-semibold"
            style={{ color: colors.darkGrey }}
          >
            {user.firstName} {user.lastName}
          </p>
        </div>

        {/* Menu */}
        <nav className="mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 mx-3 my-1 rounded-md transition-all",
                  active
                    ? "text-white shadow-sm"
                    : "text-gray-700 hover:shadow-sm"
                )}
                style={{
                  backgroundColor: active ? colors.primary : "transparent",
                  color: active ? "#fff" : colors.darkGrey,
                }}
              >
                <Icon size={18} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
