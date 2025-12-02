import { LoginForm } from "@/components/auth/forms/LoginForm";

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: "#F5F5F0" }} // offWhite
    >
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h1
          className="text-2xl font-semibold text-center"
          style={{ color: "#4A7BA7" }} // primary
        >
          Iniciar sesión
        </h1>

        <p
          className="text-sm text-center mt-1"
          style={{ color: "#3E4A4F" }} // darkGrey
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
