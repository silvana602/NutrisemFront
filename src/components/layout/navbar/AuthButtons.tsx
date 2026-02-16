"use client";

import Link from "next/link";
import { Button } from "../../ui/Button"; // o "@/components/ui/button"

interface AuthButtonsProps {
  nextQuery: string;
}

export default function AuthButtons({ nextQuery }: AuthButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline">
        <Link href={`/login${nextQuery}`}>Iniciar sesión</Link>
      </Button>

      <Button>
        <Link href={`/register${nextQuery}`}>Regístrate</Link>
      </Button>

      <button
        aria-label="Cambiar idioma"
        className="rounded-xl border border-nutri-light-grey bg-nutri-white p-2 text-nutri-dark-grey transition-colors hover:bg-nutri-off-white"
      >
      </button>
    </div>
  );
}
