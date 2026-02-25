import { Activity, BookOpenCheck, HeartPulse } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { PatientEducationCategory } from "../types";

type PatientEducationArticleLibraryProps = {
  categories: PatientEducationCategory[];
  focusedArticleId?: string | null;
};

function getCategoryIcon(icon: PatientEducationCategory["icon"]) {
  if (icon === "food") {
    return <BookOpenCheck size={18} className="text-nutri-primary" aria-hidden />;
  }

  if (icon === "development") {
    return <Activity size={18} className="text-nutri-primary" aria-hidden />;
  }

  return <HeartPulse size={18} className="text-nutri-primary" aria-hidden />;
}

export function PatientEducationArticleLibrary({
  categories,
  focusedArticleId = null,
}: PatientEducationArticleLibraryProps) {
  return (
    <section id="biblioteca-educativa" className="space-y-3">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-nutri-primary">Biblioteca de Articulos</h2>
        <p className="text-sm text-nutri-dark-grey/80">
          Explora contenido por categoria para resolver dudas de alimentacion, desarrollo y
          prevencion.
        </p>
      </div>

      {categories.length === 0 ? (
        <Card className="p-5">
          <p className="text-sm text-nutri-dark-grey">
            No se encontraron articulos para la combinacion de busqueda y etiquetas seleccionada.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.categoryId} className="h-full p-5">
              <header className="mb-4 flex items-center gap-2">
                {getCategoryIcon(category.icon)}
                <h3 className="text-base font-semibold text-nutri-primary">{category.title}</h3>
              </header>

              <div className="space-y-3">
                {category.articles.map((article) => (
                  <article
                    key={article.articleId}
                    id={`education-article-${article.articleId}`}
                    className={cn(
                      "rounded-xl border border-nutri-light-grey bg-nutri-off-white/60 p-3",
                      focusedArticleId === `education-article-${article.articleId}` &&
                        "border-nutri-secondary/40 bg-nutri-white ring-2 ring-nutri-secondary/35"
                    )}
                  >
                    <p className="text-sm font-semibold text-nutri-dark-grey">{article.title}</p>
                    <p className="mt-1 text-xs text-nutri-dark-grey/80">{article.summary}</p>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-nutri-secondary">
                      Lectura estimada: {article.readMinutes} min
                    </p>
                  </article>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
