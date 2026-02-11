export function SectionTitle({ children, className = "", }: { children: React.ReactNode;
className?: string;}) {
  return (
    <h2
      className={`mb-2 mt-8 text-lg font-semibold text-nutri-dark-grey ${className}`}
    >
      {children}
    </h2>
  );
}
