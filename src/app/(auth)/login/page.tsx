import { LoginForm } from "@/components/auth/forms/LoginForm";
import { colors } from "@/lib/colors";

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
    >
      <div className="w-full max-w-md p-8 rounded-2xl shadow-lg"
      style={{ backgroundColor: colors.white }}>
        <h1
          className="text-2xl font-semibold text-center"
          style={{ color: colors.primary }}
        >
          Iniciar sesión
        </h1>

        <p
          className="text-sm text-center mt-1"
          style={{ color: colors.darkGrey }}
        >
          Accede a la plataforma y conoce mas sobre tu estado nutricional.
        </p>

        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
