import { Card } from "@/components/ui/Card";

import type { RecommendedFoodRow } from "../types";

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
          Sigue estas porciones como referencia diaria.
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="text-sm text-nutri-dark-grey">
          Aun no hay alimentos sugeridos registrados para tu plan actual.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-nutri-light-grey bg-nutri-white">
          <table className="min-w-[980px] table-auto text-sm">
            <thead className="bg-nutri-off-white">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/80">
                <th className="px-3 py-2">Alimento</th>
                <th className="px-3 py-2">Categoria</th>
                <th className="px-3 py-2">Porcion diaria</th>
                <th className="px-3 py-2">Edad ref.</th>
                <th className="px-3 py-2">Energia (kcal)</th>
                <th className="px-3 py-2">Proteina (g)</th>
                <th className="px-3 py-2">Grasa (g)</th>
                <th className="px-3 py-2">Carbohidratos (g)</th>
                <th className="px-3 py-2">Fibra (g)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.foodId} className="border-t border-nutri-light-grey">
                  <td className="px-3 py-2 font-medium text-nutri-dark-grey">{row.foodName}</td>
                  <td className="px-3 py-2 text-nutri-dark-grey">{row.category}</td>
                  <td className="px-3 py-2 text-nutri-dark-grey">{row.dailyAmount}</td>
                  <td className="px-3 py-2 text-nutri-dark-grey">{row.referenceAge}</td>
                  <td className="px-3 py-2 text-nutri-dark-grey">{row.energyKcal}</td>
                  <td className="px-3 py-2 text-nutri-dark-grey">{row.proteinG}</td>
                  <td className="px-3 py-2 text-nutri-dark-grey">{row.fatG}</td>
                  <td className="px-3 py-2 text-nutri-dark-grey">{row.carbohydratesG}</td>
                  <td className="px-3 py-2 text-nutri-dark-grey">{row.fiberG}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
