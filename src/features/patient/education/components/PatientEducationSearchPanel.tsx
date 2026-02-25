import { Search } from "lucide-react";

import { TextInput } from "@/components/atoms/TextInput";
import { Card } from "@/components/ui/Card";
import type { PatientEducationTag, PatientEducationTagId } from "../types";
import { cn } from "@/lib/utils";

type PatientEducationSearchPanelProps = {
  query: string;
  selectedTagId: PatientEducationTagId | null;
  tags: PatientEducationTag[];
  visibleArticles: number;
  visibleVideos: number;
  onQueryChange: (nextValue: string) => void;
  onToggleTag: (tagId: PatientEducationTagId) => void;
  onClearFilters: () => void;
};

export function PatientEducationSearchPanel({
  query,
  selectedTagId,
  tags,
  visibleArticles,
  visibleVideos,
  onQueryChange,
  onToggleTag,
  onClearFilters,
}: PatientEducationSearchPanelProps) {
  return (
    <Card className="space-y-4 p-5">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-nutri-primary">Buscador de Temas Sugeridos</h2>
        <p className="text-sm text-nutri-dark-grey/80">
          Escribe una duda concreta para filtrar articulos y Nutri-Tips mas relevantes.
        </p>
      </div>

      <TextInput
        placeholder="Ej: Como introducir verduras? o Importancia del hierro"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        icon={<Search size={18} className="text-current" aria-hidden />}
      />

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isSelected = selectedTagId === tag.id;
          return (
            <button
              key={tag.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggleTag(tag.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm",
                isSelected
                  ? "border-nutri-primary bg-nutri-primary text-nutri-white"
                  : "border-nutri-primary/20 bg-nutri-off-white text-nutri-primary hover:bg-nutri-white"
              )}
            >
              {tag.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-nutri-dark-grey/80 sm:text-sm">
        <p>
          Resultados visibles: {visibleArticles} articulos y {visibleVideos} videos.
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="font-semibold text-nutri-primary underline-offset-2 hover:underline"
        >
          Limpiar filtros
        </button>
      </div>
    </Card>
  );
}
