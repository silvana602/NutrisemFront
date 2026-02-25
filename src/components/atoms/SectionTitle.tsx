import { cn } from "@/lib/utils";

export function SectionTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "mt-8 text-lg font-semibold tracking-tight text-nutri-primary sm:text-xl",
        className
      )}
    >
      {children}
    </h2>
  );
}
