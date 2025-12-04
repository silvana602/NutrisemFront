"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import { useAuthStore } from "@/store/useAuthStore";
import { colors } from "@/lib/colors"; // asegúrate de exportar tus colores aquí

export default function UserMenu() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.clearSession);

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        !ref.current?.contains(e.target as Node) &&
        !btnRef.current?.contains(e.target as Node)
      )
        close();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [close]);

  if (!user) return null;

  const isAdmin = user.role === "admin";
  const isclinician = user.role === "clinician";

  async function onLogout() {
    logout();
    router.replace("/");
  }

  const navigate = () => close();

  return (
    <div ref={ref} className="relative">
      {/* --- BOTÓN --- */}
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl bg-white px-2 py-1 shadow-sm hover:shadow-md transition-shadow duration-200"
      >
        <Avatar name={user.firstName + " " + user.lastName} size={32} />
      </button>

      {/* --- MENÚ --- */}
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-lg z-50 animate-[fadeIn_0.15s_ease-out]"
          style={{ border: `1px solid ${colors.lightGrey}` }}
        >
          {/* HEADER */}
          <div className="flex items-center gap-3 px-4 py-4">
            <Avatar name={user.firstName + " " + user.lastName} size={40} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-800">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-xs text-gray-500">
                {user.identityCard}
              </p>
            </div>
          </div>

          <div className="h-px bg-nutri-lightGrey my-2" />

          {/* LINKS */}
          {isAdmin && (
            <>
              <Link
                href="/dashboard/admin"
                onClick={navigate}
                className="block px-4 py-2 text-sm rounded-lg text-gray-700 hover:bg-primary/10 transition-colors"
                style={{ color: colors.darkGrey }}
              >
                Panel de Administración
              </Link>

              <Link
                href="/dashboard/clinician"
                onClick={navigate}
                className="block px-4 py-2 text-sm rounded-lg text-gray-700 hover:bg-primary/10 transition-colors"
                style={{ color: colors.darkGrey }}
              >
                Panel del Salubrista
              </Link>

              <Link
                href="/dashboard/patient"
                onClick={navigate}
                className="block px-4 py-2 text-sm rounded-lg text-gray-700 hover:bg-primary/10 transition-colors"
                style={{ color: colors.darkGrey }}
              >
                Panel de Paciente
              </Link>
            </>
          )}
          {isclinician && (
            <Link
              href="/dashboard/paciente"
              onClick={navigate}
              className="block px-4 py-2 text-sm rounded-lg text-gray-700 hover:bg-primary/10 transition-colors"
              style={{ color: colors.darkGrey }}
            >
              Mi Panel
            </Link>
          )}

          <Link
            href="/dashboard/settings"
            onClick={navigate}
            className="block px-4 py-2 text-sm rounded-lg hover:bg-primary/10 transition-colors"
            style={{ color: colors.darkGrey }}
          >
            Configuración
          </Link>

          <div className="h-px bg-nutri-lightGrey my-2" />

          {/* LOGOUT */}
          <button
            onClick={onLogout}
            className="w-full text-left px-4 py-2 text-sm rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
