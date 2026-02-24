import { Card } from "@/components/ui/Card";

import type { RecommendedFoodRow } from "../types";
import { PatientRecommendedFoodsTableRow } from "./PatientRecommendedFoodsTableRow";

type PatientRecommendedFoodsTableProps = {
  rows: RecommendedFoodRow[];
};

export function PatientRecommendedFoodsTable({
  rows,
}: PatientRecommendedFoodsTableProps) {
  return (
    <Card className="p-5">
      <header className="mb-3">
        <h2 className="text-lg font-semibold text-nutri-primary">Alimentos sugeridos</h2>
        <p className="text-sm text-nutri-dark-grey/80">
          Este plan resume la porcion, frecuencia y beneficio principal recomendado por tu
          nutricionista.
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="text-sm text-nutri-dark-grey">
          Aun no hay alimentos sugeridos registrados para tu plan actual.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-nutri-light-grey bg-nutri-white">
          <table className="min-w-[860px] table-auto text-sm">
            <thead className="bg-nutri-off-white">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/80">
                <th className="px-3 py-2 text-center">Imagen</th>
                <th className="px-3 py-2">Alimento</th>
                <th className="px-3 py-2">Beneficios para ti</th>
                <th className="px-3 py-2">Porcion sugerida</th>
                <th className="px-3 py-2">Frecuencia</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <PatientRecommendedFoodsTableRow key={row.foodId} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
