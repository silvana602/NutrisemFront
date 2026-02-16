import { LoginForm } from "@/components/auth/forms/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="nutri-surface w-full max-w-md p-8">
        <h1 className="text-center text-2xl font-semibold text-nutri-primary">
          Iniciar sesion
        </h1>

        <p className="mt-1 text-center text-sm text-nutri-dark-grey">
          Accede a la plataforma y conoce mas sobre tu estado nutricional.
        </p>

        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
