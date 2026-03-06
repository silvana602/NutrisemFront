"use client";

import { Search } from "lucide-react";
import { TextInput } from "@/components/atoms/TextInput";
import { Button } from "@/components/ui/Button";
import type { PatientSearchFilters } from "../types";
import { PATIENT_AGE_RANGE_OPTIONS } from "../utils";

type PatientDirectoryFiltersProps = {
  filters: PatientSearchFilters;
  onFiltersChange: (filters: PatientSearchFilters) => void;
  onClearFilters: () => void;
};

export function PatientDirectoryFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: PatientDirectoryFiltersProps) {
  return (
    <section className="nutri-platform-surface p-4 sm:p-5">
      <h2 className="text-lg font-semibold text-nutri-primary">Directorio general</h2>
      <p className="mt-1 text-sm text-nutri-dark-grey/85">
        Buscador avanzado por Cédula de Identidad, nombre o rango de edad.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_220px_auto]">
        <TextInput
          placeholder="Buscar por C.I."
          value={filters.ci}
          onChange={(event) => onFiltersChange({ ...filters, ci: event.target.value })}
          icon={<Search size={18} className="text-current" />}
          className="w-full"
        />
        <TextInput
          placeholder="Buscar por nombre completo"
          value={filters.nombre}
          onChange={(event) => onFiltersChange({ ...filters, nombre: event.target.value })}
          icon={<Search size={18} className="text-current" />}
          className="w-full"
        />
        <select
          value={filters.rangoEdad}
          onChange={(event) =>
            onFiltersChange({ ...filters, rangoEdad: event.target.value as PatientSearchFilters["rangoEdad"] })
          }
          className="nutri-input w-full"
          aria-label="Seleccionar rango de edad"
        >
          {PATIENT_AGE_RANGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Button variant="outline" onClick={onClearFilters}>
          Limpiar filtros
        </Button>
      </div>
    </section>
  );
}
