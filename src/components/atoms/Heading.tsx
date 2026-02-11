export function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h1
      className="mb-4 text-3xl font-bold text-nutri-black"
    >
      {children}
    </h1>
  );
}
