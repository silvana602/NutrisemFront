"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebarStore } from "@/store/useSidebarStore";
import { useMenuByRole } from "@/hooks/useMenuByRol";
import { Role } from "@/types/user";

import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role: Role;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const { isOpen, toggle, close } = useSidebarStore();

  const menuItems = useMenuByRole(role);

  return (
    <>
      {/* Top bar para mobile */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white shadow-md sticky top-0 z-50">
        <h1 className="text-lg font-semibold">NUTRISEM</h1>
        <button onClick={toggle} aria-label="menu">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-white shadow-lg border-r transition-transform duration-300 z-40",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="px-6 py-4 border-b">
          <h2 className="text-2xl font-bold">NUTRISEM</h2>
          <p className="text-sm text-gray-500">Panel {role.toLowerCase()}</p>
        </div>

        {/* Menu */}
        <nav className="mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon; // <-- componente
            const active = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => close()}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition",
                  active && "bg-teal-600 text-white hover:bg-teal-700"
                )}
              >
                <span className="w-5 h-5">
                  <Icon size={18} /> {/* <-- renderizamos el componente */}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Overlay móvil */}
      {isOpen && (
        <div
          onClick={close}
          className="fixed inset-0 bg-black/40 lg:hidden z-30"
        />
      )}
    </>
  );
}
