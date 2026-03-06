import Link from "next/link";
import { Stethoscope, UserRound, Users } from "lucide-react";
import { Heading } from "@/components/atoms/Heading";
import { SectionTitle } from "@/components/atoms/SectionTitle";

const userSections = [
  {
    title: "Médicos",
    description: "Administra cuentas, permisos y estado de profesionales de salud.",
    href: "/dashboard/admin/users/medicos",
    icon: Stethoscope,
  },
  {
    title: "Pacientes",
    description: "Consulta y organiza los perfiles de pacientes registrados en la plataforma.",
    href: "/dashboard/admin/users/pacientes",
    icon: UserRound,
  },
];

export default function AdminUsersPage() {
  return (
    <div className="nutri-platform-page px-1 py-1 sm:px-2">
      <div className="nutri-platform-page-header p-4 sm:p-5">
        <Heading
          containerClassName="space-y-2"
          description="Gestión centralizada de usuarios para mantener la operación del sistema."
        >
          Gestión de usuarios
        </Heading>
      </div>

      <section className="nutri-platform-surface p-4 sm:p-5">
        <SectionTitle className="mt-0">Selecciona un grupo de usuarios</SectionTitle>
        <p className="mt-2 text-sm text-nutri-dark-grey/85">
          Elige la categoría que deseas administrar desde el panel lateral o los accesos directos.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {userSections.map((section) => {
            const Icon = section.icon;

            return (
              <Link
                key={section.href}
                href={section.href}
                className="group rounded-xl border border-nutri-light-grey/80 bg-white/80 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-nutri-secondary/40 hover:shadow-[0_10px_20px_rgba(18,33,46,0.08)]"
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-nutri-light-grey bg-white text-nutri-primary transition-colors group-hover:border-nutri-secondary/40">
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-nutri-dark-grey">{section.title}</p>
                    <p className="mt-1 text-sm text-nutri-dark-grey/80">{section.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="nutri-platform-surface p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-nutri-light-grey bg-white text-nutri-primary">
            <Users size={18} />
          </span>
          <div>
            <SectionTitle className="mt-0">Buenas practicas de administracion</SectionTitle>
            <p className="mt-2 text-sm text-nutri-dark-grey/85">
              Revisa perfiles activos, valida información de contacto y documenta cambios de acceso.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
