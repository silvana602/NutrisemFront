import { colors } from '../../../lib/colors';

export const Footer = () => {
    const year = new Date().getFullYear();
    return (
        <footer className="py-8" style={{ backgroundColor: colors.darkGrey }}>
        <div className="container mx-auto px-4 text-center text-white">
          <p>&copy; {year} Nutrisem. Sistema de Monitoreo Nutricional.</p>
        </div>
      </footer>
    );
};