import { LoginForm } from "@/components/auth/forms/LoginForm";
import { Heading } from "@/components/atoms/Heading";

export default function LoginPage() {
  return (
    <div className="nutri-surface w-full p-6 sm:p-8">
      <Heading
        align="center"
        className="text-2xl font-semibold sm:text-2xl"
        description="Bienvenid@ a Nutrisem. Por favor, introduzca sus credenciales para acceder a su cuenta."
      >
        Iniciar sesion
      </Heading>

      <div className="mt-6">
        <LoginForm />
      </div>
    </div>
  );
}
