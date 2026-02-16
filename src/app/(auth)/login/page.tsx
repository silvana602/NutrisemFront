import { LoginForm } from "@/components/auth/forms/LoginForm";

export default function LoginPage() {
  return (
    <div className="nutri-surface w-full p-6 sm:p-8">
      <h1 className="text-center text-2xl font-semibold text-nutri-primary">
        Iniciar sesion
      </h1>

      <p className="mt-1 text-center text-sm text-nutri-dark-grey">
        Bienvenid@ a Nutrisem. Por favor, introduzca sus credenciales para acceder a su cuenta.
      </p>

      <div className="mt-6">
        <LoginForm />
      </div>
    </div>
  );
}
