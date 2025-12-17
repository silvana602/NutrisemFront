import { colors } from "@/lib/colors";

export function SectionTitle({ children, className = "", }: { children: React.ReactNode;
className?: string;}) {
  return (
    <h2
      className={`text-lg font-semibold mb-2 mt-8 ${className}`}
      style={{ color: colors.darkGrey }}
    >
      {children}
    </h2>
  );
}
