"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export function LoginForm() {
  const { setSession } = useAuthStore();
  const router = useRouter();

  const [ci, setCi] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api";
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ci, password }),
      });

      if (!res.ok) {
        throw new Error("Credenciales incorrectas");
      }

      const data = await res.json();
      const sessionData = {
        accessToken: data.accessToken || "mock-token",
        user: data.user,
        clinician: data.clinician || null,
      };

      setSession(sessionData);
      localStorage.setItem("session", JSON.stringify(sessionData));
      localStorage.setItem("accessToken", sessionData.accessToken);

      const dashboardPath = (() => {
        switch (data.user.role) {
          case "admin":
            return "/dashboard/admin";
          case "clinician":
            return "/dashboard/clinician";
          case "patient":
            return "/dashboard/patient";
          default:
            return "/";
        }
      })();

      router.push(dashboardPath);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error inesperado";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-nutri-dark-grey">
          CI
        </label>
        <input
          type="text"
          value={ci}
          onChange={(e) => setCi(e.target.value)}
          className="w-full rounded-lg border border-nutri-primary bg-nutri-white px-3 py-2 text-nutri-dark-grey outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-nutri-dark-grey">
          Contrasena
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-nutri-primary bg-nutri-white px-3 py-2 text-nutri-dark-grey outline-none"
          required
        />
      </div>

      {error && <p className="text-sm text-nutri-secondary">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-nutri-primary py-2 font-semibold text-nutri-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Ingresando..." : "Iniciar sesion"}
      </button>
    </form>
  );
}
