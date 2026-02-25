import { Heading } from "@/components/atoms/Heading";

export default function RegisterPage() {
  return (
    <section className="relative w-full overflow-hidden rounded-[1.5rem] border border-white/80 bg-[linear-gradient(160deg,rgba(251,249,241,0.96)_0%,rgba(245,239,235,0.88)_100%)] p-1 shadow-[0_24px_42px_rgba(18,33,46,0.2)]">
      <div className="rounded-[1.25rem] border border-white/70 bg-white/60 p-6 sm:p-8">
        <span className="mx-auto inline-flex rounded-full border border-nutri-secondary/30 bg-nutri-secondary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-nutri-primary">
          Proximamente
        </span>

        <Heading
          align="center"
          containerClassName="mt-4"
          className="text-2xl font-semibold sm:text-2xl"
          description="El registro de nuevos usuarios se habilitara en una proxima version."
        >
          Registro
        </Heading>
      </div>
    </section>
  );
}
