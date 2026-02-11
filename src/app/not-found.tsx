import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center text-nutri-white"
      style={{
        background:
          "linear-gradient(135deg, var(--color-nutri-primary), var(--color-nutri-secondary))",
      }}
    >
      <h1 className="text-[8rem] font-extrabold drop-shadow-lg animate-bounce">404</h1>
      <h2 className="text-3xl md:text-4xl font-bold mb-4">¡Oops! Página no encontrada</h2>
      <p className="mb-8 max-w-md text-lg md:text-xl">
        La página que buscas no existe, pero no te preocupes, todavía puedes volver a la página principal.
      </p>

      <Link
        href="/"
        className="px-6 py-3 bg-nutri-white text-nutri-black font-semibold rounded-full shadow-lg hover:bg-nutri-off-white transition-transform transform hover:scale-105"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
