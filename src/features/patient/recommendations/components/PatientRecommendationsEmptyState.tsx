import { Card } from "@/components/ui/Card";

export function PatientRecommendationsEmptyState() {
  return (
    <Card className="p-5">
      <h2 className="text-lg font-semibold text-nutri-primary">Sin recomendaciones registradas</h2>
      <p className="mt-2 text-sm text-nutri-dark-grey">
        Todavia no hay recomendaciones para tu perfil. Cuando tu nutricionista las registre,
        podras ver los alimentos sugeridos y los restringidos en esta seccion.
      </p>
    </Card>
  );
}
