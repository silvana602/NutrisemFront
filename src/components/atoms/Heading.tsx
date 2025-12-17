import { colors } from "@/lib/colors";

export function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h1
      className="text-3xl font-bold mb-4"
      style={{ color: colors.black }}
    >
      {children}
    </h1>
  );
}
