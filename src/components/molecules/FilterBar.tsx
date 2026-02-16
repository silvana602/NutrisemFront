"use client";

interface FilterBarProps {
  gender: string;
  age: string;
  onGenderChange: (value: string) => void;
  onAgeChange: (value: string) => void;
}

export function FilterBar({
  gender,
  age,
  onGenderChange,
  onAgeChange,
}: FilterBarProps) {
  return (
    <div className="mt-2 flex w-full flex-col gap-4 sm:mt-4 sm:flex-row sm:flex-wrap sm:items-end">
      {/* Filtro Edad */}
      <div className="flex w-full flex-col sm:w-auto">
        <label className="mb-1 text-sm font-semibold text-nutri-dark-grey">
          Edad
        </label>

        <select
          value={age}
          onChange={(e) => onAgeChange(e.target.value)}
          className="nutri-input w-full sm:min-w-[160px]"
        >
          <option value="all">Todos</option>
          <option value="0-1">0 - 1 año</option>
          <option value="1-5">1 - 5 años</option>
          <option value="6-10">6 - 10 años</option>
          <option value="11-15">11 - 15 años</option>
          <option value="16+">Más de 16</option>
        </select>
      </div>

      {/* Filtro Sexo */}
      <div className="flex w-full flex-col sm:w-auto">
        <label className="mb-1 text-sm font-semibold text-nutri-dark-grey">
          Sexo
        </label>

        <select
          value={gender}
          onChange={(e) => onGenderChange(e.target.value)}
          className="nutri-input w-full sm:min-w-[160px]"
        >
          <option value="all">Todos</option>
          <option value="M">Masculino</option>
          <option value="F">Femenino</option>
        </select>
      </div>
    </div>
  );
}
