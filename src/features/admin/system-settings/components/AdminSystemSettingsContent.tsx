"use client";

import { useMemo, useState } from "react";
import { Heading } from "@/components/atoms/Heading";
import { Button } from "@/components/ui/Button";
import AlertDialog from "@/components/ui/AlertDialog";
import { db, seedOnce } from "@/mocks/db";
import type {
  BloodPressureRangeSetting,
  MedicalFoodCatalogItem,
  OmsPercentileAnchorSetting,
} from "../types";
import {
  applyConfiguredRecommendedFoodsToDb,
  persistSystemMedicalSettings,
  readSystemMedicalSettings,
  resetSystemMedicalSettings,
  toSystemMedicalSettingsDraft,
} from "../utils";
import { BloodPressureRangesSection } from "./BloodPressureRangesSection";
import { FoodCatalogSection } from "./FoodCatalogSection";
import { OmsPercentilesSection } from "./OmsPercentilesSection";

seedOnce();

function cloneFoodsSnapshot() {
  return db.foods.map((food) => ({ ...food }));
}

export default function AdminSystemSettingsContent() {
  const defaultFoods = useMemo(() => cloneFoodsSnapshot(), []);
  const [draft, setDraft] = useState(() =>
    toSystemMedicalSettingsDraft(readSystemMedicalSettings(defaultFoods))
  );
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const updateBloodPressureRange = (
    rangeId: string,
    nextRange: BloodPressureRangeSetting
  ) => {
    setDraft((current) => ({
      ...current,
      bloodPressureRanges: current.bloodPressureRanges.map((range) =>
        range.id === rangeId ? nextRange : range
      ),
    }));
  };

  const addBloodPressureRange = () => {
    const nextIndex = draft.bloodPressureRanges.length + 1;
    setDraft((current) => ({
      ...current,
      bloodPressureRanges: [
        ...current.bloodPressureRanges,
        {
          id: `bp-custom-${Date.now()}`,
          ageGroup: `Rango personalizado ${nextIndex}`,
          fromMonths: 0,
          toMonths: 0,
          systolic: { min: 90, max: 110 },
          diastolic: { min: 60, max: 75 },
        },
      ],
    }));
  };

  const removeBloodPressureRange = (rangeId: string) => {
    setDraft((current) => ({
      ...current,
      bloodPressureRanges: current.bloodPressureRanges.filter(
        (range) => range.id !== rangeId
      ),
    }));
  };

  const updateOmsAnchor = (
    anchorKey: OmsPercentileAnchorSetting["key"],
    nextAnchor: OmsPercentileAnchorSetting
  ) => {
    setDraft((current) => ({
      ...current,
      omsPercentileAnchors: current.omsPercentileAnchors.map((anchor) =>
        anchor.key === anchorKey ? nextAnchor : anchor
      ),
    }));
  };

  const addFoodCatalogItem = (item: Omit<MedicalFoodCatalogItem, "id">) => {
    setDraft((current) => ({
      ...current,
      foodCatalog: [
        ...current.foodCatalog,
        {
          ...item,
          id: `food-cfg-${Date.now()}-${current.foodCatalog.length + 1}`,
        },
      ],
    }));
  };

  const updateFoodCatalogItem = (itemId: string, nextItem: MedicalFoodCatalogItem) => {
    setDraft((current) => ({
      ...current,
      foodCatalog: current.foodCatalog.map((item) =>
        item.id === itemId ? nextItem : item
      ),
    }));
  };

  const toggleFoodCatalogItem = (itemId: string) => {
    setDraft((current) => ({
      ...current,
      foodCatalog: current.foodCatalog.map((item) =>
        item.id === itemId ? { ...item, active: !item.active } : item
      ),
    }));
  };

  const removeFoodCatalogItem = (itemId: string) => {
    setDraft((current) => ({
      ...current,
      foodCatalog: current.foodCatalog.filter((item) => item.id !== itemId),
    }));
  };

  const handleSave = () => {
    const persisted = persistSystemMedicalSettings(draft, defaultFoods);
    if (!persisted) {
      setSaveMessage("No se pudo guardar la configuración. Intenta nuevamente.");
      return;
    }

    applyConfiguredRecommendedFoodsToDb(db.foods, defaultFoods);
    setSaveMessage(
      "Configuración del sistema guardada correctamente. Los parámetros médicos y el vademécum fueron actualizados."
    );
  };

  const handleReset = () => {
    const defaults = resetSystemMedicalSettings(defaultFoods);
    setDraft(toSystemMedicalSettingsDraft(defaults));
    applyConfiguredRecommendedFoodsToDb(db.foods, defaultFoods);
    setSaveMessage("Se restauraron los valores predeterminados del sistema.");
  };

  return (
    <div className="nutri-platform-page px-1 py-1 sm:px-2">
      <div className="nutri-platform-page-header p-4 sm:p-5">
        <Heading
          containerClassName="space-y-2"
          description="Configura parámetros clínicos críticos y el catálogo de alimentos para recomendaciones médicas."
        >
          Configuración del sistema
        </Heading>
      </div>

      <div className="nutri-platform-surface-soft flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <p className="text-sm text-nutri-dark-grey/85">
          Esta configuración afecta precisión clínica y recomendaciones nutricionales.
        </p>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button variant="outline" onClick={handleReset}>
            Restaurar predeterminados
          </Button>
          <Button onClick={handleSave}>Guardar configuración médica</Button>
        </div>
      </div>

      <BloodPressureRangesSection
        ranges={draft.bloodPressureRanges}
        onUpdateRange={updateBloodPressureRange}
        onAddRange={addBloodPressureRange}
        onRemoveRange={removeBloodPressureRange}
      />

      <OmsPercentilesSection
        anchors={draft.omsPercentileAnchors}
        onUpdateAnchor={updateOmsAnchor}
      />

      <FoodCatalogSection
        items={draft.foodCatalog}
        onAddItem={addFoodCatalogItem}
        onUpdateItem={updateFoodCatalogItem}
        onToggleItemActive={toggleFoodCatalogItem}
        onRemoveItem={removeFoodCatalogItem}
      />

      <AlertDialog
        open={Boolean(saveMessage)}
        title="Configuración médica"
        message={saveMessage ?? ""}
        onClose={() => setSaveMessage(null)}
      />
    </div>
  );
}
