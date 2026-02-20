import { Suspense } from "react";
import UnauthorizedPageClient from "./UnauthorizedPageClient";

function UnauthorizedPageFallback() {
  return (
    <div className="flex min-h-[calc(100dvh-var(--nutri-navbar-height)-var(--nutri-footer-height))] items-center justify-center px-4 text-sm text-nutri-dark-grey">
      Cargando...
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={<UnauthorizedPageFallback />}>
      <UnauthorizedPageClient />
    </Suspense>
  );
}
