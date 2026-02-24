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
      title="Semaforo alimentario (alimentos restringidos)"
      description="Zona roja: evita estos alimentos. Zona amarilla: consumo ocasional (maximo una vez por semana), siempre con sustitutos saludables."
    />
  );
}
