export const Footer = () => {
    const year = new Date().getFullYear();
    return (
        <footer className="relative z-20 border-t border-nutri-light-grey bg-nutri-white">
        <div className="container mx-auto flex min-h-[var(--nutri-footer-height)] items-center justify-center px-3 text-center text-xs text-nutri-dark-grey sm:px-4 sm:text-sm">
          <p>&copy; {year} Nutrisem. Sistema de Monitoreo Nutricional.</p>
        </div>
      </footer>
    );
};
