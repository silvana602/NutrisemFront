"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { BloodPressureRangeSetting } from "../types";

type BloodPressureRangesSectionProps = {
  ranges: BloodPressureRangeSetting[];
  onUpdateRange: (rangeId: string, nextRange: BloodPressureRangeSetting) => void;
  onAddRange: () => void;
  onRemoveRange: (rangeId: string) => void;
};

export function BloodPressureRangesSection({
  ranges,
  onUpdateRange,
  onAddRange,
  onRemoveRange,
}: BloodPressureRangesSectionProps) {
  return (
    <section className="nutri-platform-surface p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-nutri-primary">
            Gestión de rangos de presión arterial
          </h2>
          <p className="mt-1 text-sm text-nutri-dark-grey/85">
            Edita parámetros por grupo etario sin tocar el código.
          </p>
        </div>
        <Button variant="outline" onClick={onAddRange}>
          <Plus size={16} />
          Agregar rango
        </Button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-nutri-light-grey/80">
        <table className="min-w-[980px] w-full bg-white/80 text-sm">
          <thead className="bg-nutri-off-white text-xs uppercase tracking-wide text-nutri-dark-grey/80">
            <tr>
              <th className="px-3 py-3 text-left">Grupo etario</th>
              <th className="px-3 py-3 text-left">Mes inicio</th>
              <th className="px-3 py-3 text-left">Mes fin</th>
              <th className="px-3 py-3 text-left">Sistólica mín</th>
              <th className="px-3 py-3 text-left">Sistólica máx</th>
              <th className="px-3 py-3 text-left">Diastólica mín</th>
              <th className="px-3 py-3 text-left">Diastólica máx</th>
              <th className="px-3 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ranges.map((range) => (
              <tr key={range.id} className="border-t border-nutri-light-grey/70">
                <td className="px-3 py-3">
                  <input
                    value={range.ageGroup}
                    onChange={(event) =>
                      onUpdateRange(range.id, { ...range, ageGroup: event.target.value })
                    }
                    className="nutri-input w-full"
                  />
                </td>
                <td className="px-3 py-3">
                  <input
                    type="number"
                    value={range.fromMonths}
                    onChange={(event) =>
                      onUpdateRange(range.id, {
                        ...range,
                        fromMonths: Number(event.target.value),
                      })
                    }
                    className="nutri-input w-full"
                  />
                </td>
                <td className="px-3 py-3">
                  <input
                    type="number"
                    value={range.toMonths}
                    onChange={(event) =>
                      onUpdateRange(range.id, {
                        ...range,
                        toMonths: Number(event.target.value),
                      })
                    }
                    className="nutri-input w-full"
                  />
                </td>
                <td className="px-3 py-3">
                  <input
                    type="number"
                    value={range.systolic.min}
                    onChange={(event) =>
                      onUpdateRange(range.id, {
                        ...range,
                        systolic: {
                          ...range.systolic,
                          min: Number(event.target.value),
                        },
                      })
                    }
                    className="nutri-input w-full"
                  />
                </td>
                <td className="px-3 py-3">
                  <input
                    type="number"
                    value={range.systolic.max}
                    onChange={(event) =>
                      onUpdateRange(range.id, {
                        ...range,
                        systolic: {
                          ...range.systolic,
                          max: Number(event.target.value),
                        },
                      })
                    }
                    className="nutri-input w-full"
                  />
                </td>
                <td className="px-3 py-3">
                  <input
                    type="number"
                    value={range.diastolic.min}
                    onChange={(event) =>
                      onUpdateRange(range.id, {
                        ...range,
                        diastolic: {
                          ...range.diastolic,
                          min: Number(event.target.value),
                        },
                      })
                    }
                    className="nutri-input w-full"
                  />
                </td>
                <td className="px-3 py-3">
                  <input
                    type="number"
                    value={range.diastolic.max}
                    onChange={(event) =>
                      onUpdateRange(range.id, {
                        ...range,
                        diastolic: {
                          ...range.diastolic,
                          max: Number(event.target.value),
                        },
                      })
                    }
                    className="nutri-input w-full"
                  />
                </td>
                <td className="px-3 py-3">
                  <Button
                    variant="outline"
                    className="px-3 py-1.5 text-xs"
                    onClick={() => onRemoveRange(range.id)}
                    disabled={ranges.length <= 1}
                  >
                    <Trash2 size={14} />
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
