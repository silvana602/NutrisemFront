import { RestrictedFoodsList } from "@/components/molecules/RestrictedFoodsList";
import type { RestrictedFoodGroup } from "@/features/shared/nutrition";

type PatientRestrictedFoodsListProps = {
  groups: RestrictedFoodGroup[];
};

export function PatientRestrictedFoodsList({
  groups,
}: PatientRestrictedFoodsListProps) {
  return (
    <RestrictedFoodsList
      groups={groups}
      title="Alimentos restringidos"
      description="Ordenados desde lo que debes evitar por completo hasta lo que debes disminuir."
    />
  );
}
