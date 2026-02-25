import Link from "next/link";
import { ArrowRight } from "lucide-react";

type PatientEducationBannerProps = {
  question: string;
  href?: string;
};

export function PatientEducationBanner({
  question,
  href = "/dashboard/patient/education",
}: PatientEducationBannerProps) {
  return (
    <section>
      <Link
        href={href}
        className="group flex flex-col justify-between gap-3 rounded-2xl border border-nutri-primary/10 bg-gradient-to-r from-nutri-primary to-nutri-secondary p-5 text-nutri-white shadow-sm transition-all hover:brightness-105 sm:flex-row sm:items-center"
      >
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-nutri-off-white/85">
            Acceso rapido a educacion
          </p>
          <p className="mt-1 text-sm font-medium sm:text-base">{question}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-nutri-white/35 px-3 py-1 text-sm font-semibold">
          Ir ahora
          <ArrowRight size={16} aria-hidden />
        </span>
      </Link>
    </section>
  );
}
