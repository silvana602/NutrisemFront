import { RestrictedFoodsList } from "@/components/molecules/RestrictedFoodsList";
import type { RestrictedFoodGroup } from "@/features/shared/nutrition";

type DiagnosisRestrictedFoodsSectionProps = {
  groups: RestrictedFoodGroup[];
};

export function DiagnosisRestrictedFoodsSection({
  groups,
}: DiagnosisRestrictedFoodsSectionProps) {
  return (
    <RestrictedFoodsList
      groups={groups}
      title="Alimentos restringidos para el paciente"
      description="Ordenados de los que no debe consumir en absoluto a los que debe bajar su consumo."
    />
  );
}
