export const Footer = () => {
    const year = new Date().getFullYear();
    return (
        <footer className="bg-nutri-dark-grey py-8">
        <div className="container mx-auto px-4 text-center text-nutri-white">
          <p>&copy; {year} Nutrisem. Sistema de Monitoreo Nutricional.</p>
        </div>
      </footer>
    );
};
