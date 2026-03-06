"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { TextInput } from "@/components/atoms/TextInput";
import { Button } from "@/components/ui/Button";
import type { MedicalFoodCatalogItem } from "../types";

type FoodCatalogSectionProps = {
  items: MedicalFoodCatalogItem[];
  onAddItem: (item: Omit<MedicalFoodCatalogItem, "id">) => void;
  onUpdateItem: (itemId: string, nextItem: MedicalFoodCatalogItem) => void;
  onToggleItemActive: (itemId: string) => void;
  onRemoveItem: (itemId: string) => void;
};

const EMPTY_DRAFT: Omit<MedicalFoodCatalogItem, "id"> = {
  name: "",
  category: "",
  type: "recomendado",
  healthySubstitute: "",
  active: true,
};

export function FoodCatalogSection({
  items,
  onAddItem,
  onUpdateItem,
  onToggleItemActive,
  onRemoveItem,
}: FoodCatalogSectionProps) {
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<Omit<MedicalFoodCatalogItem, "id">>(EMPTY_DRAFT);

  const filteredItems = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase();
    if (!normalizedQuery) return items;
    return items.filter((item) =>
      `${item.name} ${item.category}`.toLowerCase().includes(normalizedQuery)
    );
  }, [items, search]);

  const canAdd = Boolean(draft.name.trim() && draft.category.trim());

  return (
    <section className="nutri-platform-surface p-4 sm:p-5">
      <h2 className="text-lg font-semibold text-nutri-primary">Vademécum / alimentos</h2>
      <p className="mt-1 text-sm text-nutri-dark-grey/85">
        Base de alimentos recomendados y restringidos para la pestaña de recomendaciones del médico.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_200px_minmax(0,1fr)_auto]">
        <TextInput
          placeholder="Nombre del alimento"
          value={draft.name}
          onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
        />
        <TextInput
          placeholder="Categoría"
          value={draft.category}
          onChange={(event) =>
            setDraft((current) => ({ ...current, category: event.target.value }))
          }
        />
        <select
          value={draft.type}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              type: event.target.value === "restringido" ? "restringido" : "recomendado",
            }))
          }
          className="nutri-input w-full"
          aria-label="Tipo de alimento"
        >
          <option value="recomendado">Recomendado</option>
          <option value="restringido">Restringido</option>
        </select>
        <TextInput
          placeholder="Sustitución saludable (opcional)"
          value={draft.healthySubstitute}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              healthySubstitute: event.target.value,
            }))
          }
        />
        <Button
          onClick={() => {
            if (!canAdd) return;
            onAddItem(draft);
            setDraft(EMPTY_DRAFT);
          }}
          disabled={!canAdd}
        >
          <Plus size={16} />
          Agregar
        </Button>
      </div>

      <div className="mt-4">
        <TextInput
          placeholder="Buscar alimento por nombre o categoría"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-nutri-light-grey/80">
        <table className="min-w-[980px] w-full bg-white/80 text-sm">
          <thead className="bg-nutri-off-white text-xs uppercase tracking-wide text-nutri-dark-grey/80">
            <tr>
              <th className="px-3 py-3 text-left">Nombre</th>
              <th className="px-3 py-3 text-left">Categoría</th>
              <th className="px-3 py-3 text-left">Tipo</th>
              <th className="px-3 py-3 text-left">Sustitución saludable</th>
              <th className="px-3 py-3 text-left">Estado</th>
              <th className="px-3 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id} className="border-t border-nutri-light-grey/70">
                <td className="px-3 py-3">
                  <input
                    value={item.name}
                    onChange={(event) =>
                      onUpdateItem(item.id, {
                        ...item,
                        name: event.target.value,
                      })
                    }
                    className="nutri-input w-full"
                  />
                </td>
                <td className="px-3 py-3">
                  <input
                    value={item.category}
                    onChange={(event) =>
                      onUpdateItem(item.id, {
                        ...item,
                        category: event.target.value,
                      })
                    }
                    className="nutri-input w-full"
                  />
                </td>
                <td className="px-3 py-3">
                  <select
                    value={item.type}
                    onChange={(event) =>
                      onUpdateItem(item.id, {
                        ...item,
                        type:
                          event.target.value === "restringido"
                            ? "restringido"
                            : "recomendado",
                      })
                    }
                    className="nutri-input w-full"
                  >
                    <option value="recomendado">Recomendado</option>
                    <option value="restringido">Restringido</option>
                  </select>
                </td>
                <td className="px-3 py-3">
                  <input
                    value={item.healthySubstitute}
                    onChange={(event) =>
                      onUpdateItem(item.id, {
                        ...item,
                        healthySubstitute: event.target.value,
                      })
                    }
                    className="nutri-input w-full"
                  />
                </td>
                <td className="px-3 py-3">
                  <button
                    type="button"
                    onClick={() => onToggleItemActive(item.id)}
                    className="rounded-full border border-nutri-primary/20 px-2 py-0.5 text-xs font-semibold text-nutri-primary transition-colors hover:bg-nutri-off-white"
                  >
                    {item.active ? "Activo" : "Inactivo"}
                  </button>
                </td>
                <td className="px-3 py-3">
                  <Button
                    variant="outline"
                    className="px-3 py-1.5 text-xs"
                    onClick={() => onRemoveItem(item.id)}
                  >
                    <Trash2 size={14} />
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}

            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-nutri-dark-grey">
                  No hay alimentos que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
