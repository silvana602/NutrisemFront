"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import { useAuthStore } from "@/store/useAuthStore";

export default function UserMenu() {
  const router = useRouter();

  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.clearSession);

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        !ref.current?.contains(e.target as Node) &&
        !btnRef.current?.contains(e.target as Node)
      ) {
        close();
      }
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
  const isHealthcare = user.role === "healthcare";

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
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 rounded-xl border border-nutri-lightGrey bg-nutri-offWhite px-2 py-1 hover:bg-nutri-primary/10 transition-colors"
      >
        <Avatar
          name={user.firstName + " " + user.lastName}
          size={32}
        />
      </button>

      {/* --- MENÚ --- */}
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 rounded-2xl border border-nutri-lightGrey bg-white shadow-xl z-50 animate-[fadeIn_0.15s_ease-out]"
        >
          {/* HEADER */}
          <div className="flex items-center gap-3 px-3 py-3">
            <Avatar
              name={user.firstName + ' ' + user.lastName}
              size={40}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-nutri-darkGrey">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-xs text-nutri-darkGrey/70">{user.identityCard}</p>
            </div>
          </div>

          <div className="h-px bg-nutri-lightGrey my-2" />

          {/* ADMIN */}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={navigate}
              className="block rounded-lg px-3 py-2 text-sm hover:bg-nutri-primary/10 transition-colors"
            >
              Panel de Administración
            </Link>
          )}

          {/* MONITOR / HEALTHCARE */}
          {isHealthcare && (
            <Link
              href="/healthcare"
              onClick={navigate}
              className="block rounded-lg px-3 py-2 text-sm hover:bg-nutri-primary/10 transition-colors"
            >
              Panel del Monitor
            </Link>
          )}

          <div className="h-px bg-nutri-lightGrey my-2" />

          {/* CONFIG */}
          <Link
            href="/dashboard"
            onClick={navigate}
            className="block rounded-lg px-3 py-2 text-sm hover:bg-nutri-primary/10 transition-colors"
          >
            Mi Panel
          </Link>

          <Link
            href="/dashboard/settings"
            onClick={navigate}
            className="block rounded-lg px-3 py-2 text-sm hover:bg-nutri-primary/10 transition-colors"
          >
            Configuración
          </Link>

          <div className="h-px bg-nutri-lightGrey my-2" />

          {/* LOGOUT */}
          <button
            onClick={onLogout}
            className="w-full text-left rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
