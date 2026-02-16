export const Footer = () => {
    const year = new Date().getFullYear();
    return (
        <footer className="border-t border-nutri-light-grey bg-nutri-white">
        <div className="container mx-auto flex min-h-[var(--nutri-footer-height)] items-center justify-center px-4 text-center text-sm text-nutri-dark-grey">
          <p>&copy; {year} Nutrisem. Sistema de Monitoreo Nutricional.</p>
        </div>
      </footer>
    );
};
