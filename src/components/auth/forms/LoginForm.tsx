// "use client";

// import React, { useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
// // import { useAppDispatch } from "../../../redux/hooks";
// // import { setCredentials } from "../../../redux/slices/authSlice";
// import { login } from "@/services/auth.service";
// import { Button } from "@/components/ui/Button";
// // import { Input } from "@/components/ui/Input";
// import { Card } from "@/components/ui/Card";
// import { colors } from "@/lib/colors";

// function sanitizeNext(nextRaw: string | null): string {
//   if (!nextRaw) return "";
//   if (!nextRaw.startsWith("/")) return "";
//   if (nextRaw === "/login" || nextRaw.startsWith("/login/")) return "";
//   if (nextRaw === "/register" || nextRaw.startsWith("/register/")) return "";
//   return nextRaw;
// }

// export const LoginForm: React.FC = () => {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [show, setShow] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const router = useRouter();
//   // const dispatch = useAppDispatch();
//   const searchParams = useSearchParams();
//   const nextPath = sanitizeNext(searchParams.get("next"));

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     if (loading) return;

//     setError(null);
//     setLoading(true);
//     try {
//       const data = await login({ userName: username.trim(), password });
//       dispatch(
//         setCredentials({
//           accessToken: data.accessToken,
//           user: data.user,
//         })
//       );

//       const target = nextPath || "/";
//       router.replace(target);
//     } catch (err: any) {
//       setError(err?.message ?? "No se pudo iniciar sesión");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div
//       className="min-h-screen flex items-center justify-center px-4"
//       style={{ backgroundColor: colors.offWhite }}
//     >
//       <Card className="w-full max-w-md">
//         <div className="text-center mb-8">
//           <div
//             className="w-16 h-16 mx-auto mb-4 rounded-lg flex items-center justify-center text-white font-bold text-2xl"
//             style={{ backgroundColor: colors.primary }}
//           >
//             N
//           </div>
//           <h1
//             className="text-3xl font-bold mb-2"
//             style={{ color: colors.darkGrey }}
//           >
//             Iniciar Sesión
//           </h1>
//           <p style={{ color: colors.darkGrey }}>
//             Accede a tu cuenta de Nutrisem
//           </p>
//         </div>

//         <form onSubmit={handleSubmit}>
//           <Input
//             label="Nombre de usuario"
//             type="text"
//             placeholder="Ingrese su nombre de usuario"
//             value={username}
//             onChange={setUsername}
//             required
//           />

//           <div className="relative">
//             <Input
//               label="Contraseña"
//               type={show ? "text" : "password"}
//               placeholder="********"
//               value={password}
//               onChange={setPassword}
//               autoComplete="current-password"
//               required
//             />
//             <button
//               type="button"
//               onClick={() => setShow((v) => !v)}
//               className="absolute right-3 top-9 text-xs text-fg/70"
//               aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
//             >
//               {show ? "Ocultar" : "Ver"}
//             </button>
//           </div>

//           {error && (
//             <div
//               className="mt-3 p-3 rounded-lg text-sm"
//               style={{ backgroundColor: "#fee", color: "#c00" }}
//             >
//               {error}
//             </div>
//           )}

//           <div className="mb-6 mt-4 text-right">
//             <button
//               type="button"
//               className="text-sm hover:underline"
//               style={{ color: colors.primary }}
//             >
//               ¿Olvidó su contraseña?
//             </button>
//           </div>

//           <Button
//             type="submit"
//             className="w-full mb-4"
//             disabled={loading || !username || !password}
//           >
//             {loading ? "Ingresando..." : "Ingresar"}
//           </Button>

//           <div className="text-center">
//             <span style={{ color: colors.darkGrey }}>¿No tiene cuenta? </span>
//             <Link
//               className="font-semibold hover:underline"
//               style={{ color: colors.primary }}
//               href={`/register${
//                 nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""
//               }`}
//             >
//               Regístrate
//             </Link>
//           </div>
//         </form>

//         <div
//           className="mt-6 pt-6 border-t text-center"
//           style={{ borderColor: colors.lightGrey }}
//         >
//           <Link
//             className="text-sm hover:underline"
//             style={{ color: colors.darkGrey }}
//             href={`/${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`}
//           >
//             ← Volver al inicio
//           </Link>
//         </div>

//         <div
//           className="mt-6 p-4 rounded-lg text-sm"
//           style={{ backgroundColor: colors.offWhite }}
//         >
//           <p className="font-semibold mb-2" style={{ color: colors.darkGrey }}>
//             Credenciales de prueba:
//           </p>
//           <p style={{ color: colors.darkGrey }}>
//             Admin: admin@nutrisem.com / admin123
//           </p>
//           <p style={{ color: colors.darkGrey }}>
//             Médico: medico@nutrisem.com / medico123
//           </p>
//         </div>
//       </Card>
//     </div>
//   );
// };

"use client"

export const LoginForm = () => {
  return (
    <div>LoginForm</div>
  )
}


