import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type PatientRecommendationsPdfDownloadCardProps = {
  isGenerating: boolean;
  onDownloadPdf: () => void;
};

export function PatientRecommendationsPdfDownloadCard({
  isGenerating,
  onDownloadPdf,
}: PatientRecommendationsPdfDownloadCardProps) {
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-nutri-primary">Descarga en PDF</h2>
          <p className="text-sm text-nutri-dark-grey/80">
            Incluye la recomendacion alimentaria, alimentos sugeridos y prohibiciones con sustitutos.
          </p>
        </div>

        <Button
          variant="primary"
          className="w-full px-4 py-2 text-xs sm:w-auto sm:text-sm"
          onClick={onDownloadPdf}
          disabled={isGenerating}
        >
          {isGenerating ? "Generando PDF..." : "Descargar recomendaciones y prohibiciones en PDF"}
        </Button>
      </div>
    </Card>
  );
}
