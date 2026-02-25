import { cn } from "@/lib/utils";

type HeadingVariant = "plain" | "panel";
type HeadingAlign = "left" | "center";

type HeadingProps = {
  children: React.ReactNode;
  eyebrow?: string;
  description?: React.ReactNode;
  variant?: HeadingVariant;
  align?: HeadingAlign;
  as?: "h1" | "h2";
  className?: string;
  containerClassName?: string;
  descriptionClassName?: string;
};

export function Heading({
  children,
  eyebrow,
  description,
  variant = "plain",
  align = "left",
  as = "h1",
  className,
  containerClassName,
  descriptionClassName,
}: HeadingProps) {
  const Tag = as;
  const isPanel = variant === "panel";
  const isCentered = align === "center";

  return (
    <header
      className={cn(
        isPanel &&
          "nutri-panel-heading rounded-2xl border border-nutri-secondary/20 bg-gradient-to-r from-nutri-white via-nutri-off-white to-nutri-light-grey/45 p-5 shadow-sm sm:p-6",
        !isPanel && "space-y-2",
        isCentered && "text-center",
        containerClassName
      )}
    >
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-nutri-secondary">
          {eyebrow}
        </p>
      ) : null}

      <Tag
        className={cn(
          "nutri-heading text-2xl font-bold text-nutri-primary sm:text-3xl",
          eyebrow && "mt-2",
          className
        )}
      >
        {children}
      </Tag>

      {description ? (
        <p
          className={cn(
            "text-sm text-nutri-dark-grey sm:text-base",
            eyebrow && "mt-2",
            isCentered ? "mx-auto max-w-2xl" : "max-w-3xl",
            descriptionClassName
          )}
        >
          {description}
        </p>
      ) : null}
    </header>
  );
}
