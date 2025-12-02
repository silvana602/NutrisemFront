"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { colors } from "@/lib/colors";

export function LoginForm() {
  const setUser = useAuthStore((s) => s.setUser);

  const [ci, setCi] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        credentials: "include", // ⬅ MUY IMPORTANTE (activa cookies HttpOnly)
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ci, password }),
      });

      if (!res.ok) {
        throw new Error("Credenciales incorrectas");
      }

      const data = await res.json();

      // Guardar datos del usuario en Zustand
      setUser(data.user);

      // Redirigir al dashboard
      window.location.href = "/dashboard";

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">CI</label>
        <input
          type="text"
          value={ci}
          onChange={(e) => setCi(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
          style={{ borderColor: colors.primary }}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
          style={{ borderColor: colors.primary }}
          required
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 rounded-lg font-semibold text-white"
        style={{ backgroundColor: colors.primary }}
      >
        {loading ? "Ingresando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
