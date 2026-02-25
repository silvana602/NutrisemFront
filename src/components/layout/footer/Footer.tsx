export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-20 border-t border-white/65 bg-[linear-gradient(120deg,rgba(251,249,241,0.96)_0%,rgba(245,239,235,0.9)_50%,rgba(231,233,227,0.85)_100%)] shadow-[0_-10px_24px_rgba(18,33,46,0.08)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nutri-secondary/40 to-transparent" />

      <div className="mx-auto flex min-h-[var(--nutri-footer-height)] w-full max-w-[1480px] items-center justify-center px-3 py-3 sm:px-4 lg:px-6">
        <p className="text-center text-[11px] font-medium text-nutri-dark-grey/75 sm:text-xs">
          &copy; {year} Nutrisem. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};
