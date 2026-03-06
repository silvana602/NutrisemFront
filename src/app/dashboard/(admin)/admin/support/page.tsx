import Link from "next/link";
import { ArrowUpRight, LifeBuoy, Mail } from "lucide-react";
import { Heading } from "@/components/atoms/Heading";
import { SectionTitle } from "@/components/atoms/SectionTitle";
import {
  ADMIN_SUPPORT_TICKETS,
  getSupportRoleLabel,
  SHARED_SUPPORT_DESCRIPTION,
  SHARED_SUPPORT_EMAIL,
  SHARED_SUPPORT_MAILTO,
  SHARED_SUPPORT_SHORTCUTS,
  SHARED_SUPPORT_TITLE,
} from "@/features/support/utils/sharedSupport.utils";

function getStatusTone(status: "Pendiente" | "En revisión" | "Resuelto"): string {
  if (status === "Pendiente") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  if (status === "En revisión") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

export default function AdminSupportPage() {
  return (
    <div className="nutri-platform-page px-1 py-1 sm:px-2">
      <div className="nutri-platform-page-header p-4 sm:p-5">
        <Heading
          containerClassName="space-y-2"
          description="Centro básico de soporte para administración, conectado a los canales de Médico y Paciente."
        >
          Soporte técnico
        </Heading>
      </div>

      <section className="nutri-platform-surface p-4 sm:p-5">
        <SectionTitle className="mt-0">Canal compartido con otros roles</SectionTitle>
        <p className="mt-2 text-sm text-nutri-dark-grey/85">
          Este es el mismo canal de soporte disponible en la configuración de Médico y
          Paciente/Padre.
        </p>

        <a
          href={SHARED_SUPPORT_MAILTO}
          className="mt-4 flex items-start gap-3 rounded-xl border border-nutri-light-grey/80 bg-white/80 px-4 py-3 transition-colors hover:bg-nutri-off-white"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-nutri-light-grey bg-white text-nutri-primary">
            <Mail size={16} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-nutri-primary">
              {SHARED_SUPPORT_TITLE}
            </span>
            <span className="mt-1 block text-xs text-nutri-dark-grey/80">
              {SHARED_SUPPORT_DESCRIPTION}
            </span>
            <span className="mt-1 block text-xs font-semibold text-nutri-dark-grey">
              {SHARED_SUPPORT_EMAIL}
            </span>
          </span>
        </a>
      </section>

      <section className="nutri-platform-surface p-4 sm:p-5">
        <SectionTitle className="mt-0">Vínculos con soporte por rol</SectionTitle>
        <p className="mt-2 text-sm text-nutri-dark-grey/85">
          Accesos rápidos a la configuración de soporte de los demás paneles.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {SHARED_SUPPORT_SHORTCUTS.map((shortcut) => (
            <Link
              key={shortcut.role}
              href={shortcut.href}
              className="group rounded-xl border border-nutri-light-grey/80 bg-white/80 px-4 py-3 transition-all hover:-translate-y-0.5 hover:bg-nutri-off-white"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-nutri-primary">{shortcut.roleLabel}</p>
                  <p className="mt-1 text-xs text-nutri-dark-grey/80">{shortcut.description}</p>
                </div>
                <ArrowUpRight
                  size={16}
                  className="mt-0.5 text-nutri-secondary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="nutri-platform-surface p-4 sm:p-5">
        <SectionTitle className="mt-0">Solicitudes recientes</SectionTitle>
        <p className="mt-2 text-sm text-nutri-dark-grey/85">
          Vista elemental de incidencias reportadas por Médico y Paciente/Padre.
        </p>

        <ul className="mt-4 space-y-3">
          {ADMIN_SUPPORT_TICKETS.map((ticket) => (
            <li
              key={ticket.ticketId}
              className="rounded-xl border border-nutri-light-grey/80 bg-white/80 px-4 py-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-nutri-dark-grey">
                    {ticket.ticketId} - {ticket.asunto}
                  </p>
                  <p className="mt-1 text-xs text-nutri-dark-grey/80">
                    {ticket.solicitante} ({getSupportRoleLabel(ticket.role)}) -{" "}
                    {ticket.fechaEtiqueta}
                  </p>
                </div>
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusTone(
                    ticket.estado
                  )}`}
                >
                  {ticket.estado}
                </span>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-4 rounded-xl border border-nutri-primary/20 bg-nutri-primary/5 px-4 py-3 text-xs text-nutri-dark-grey/85">
          <p className="flex items-center gap-2 font-semibold text-nutri-primary">
            <LifeBuoy size={14} />
            Módulo elemental de soporte
          </p>
          <p className="mt-1">
            Este panel consolida lo esencial: canal compartido, accesos por rol y seguimiento
            rápido de incidencias.
          </p>
        </div>
      </section>
    </div>
  );
}
