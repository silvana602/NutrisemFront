import { Heading } from "@/components/atoms/Heading";

type AdminDashboardHeroProps = {
  firstName: string;
  lastName: string;
};

export function AdminDashboardHero({ firstName, lastName }: AdminDashboardHeroProps) {
  return (
    <Heading
      containerClassName="space-y-2"
      description="Vista general del sistema con métricas clave, actividad horaria y estado de servicios."
    >
      Panel de control de Administración - {firstName} {lastName}
    </Heading>
  );
}
