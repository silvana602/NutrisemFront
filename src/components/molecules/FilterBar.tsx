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
    <div className="flex flex-wrap gap-4 items-center mt-4">
      {/* Filtro Edad */}
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-semibold text-nutri-dark-grey">
          Edad
        </label>

        <select
          value={age}
          onChange={(e) => onAgeChange(e.target.value)}
          className="rounded-lg border border-nutri-light-grey bg-nutri-white px-3 py-2 text-nutri-dark-grey shadow-sm"
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
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-semibold text-nutri-dark-grey">
          Sexo
        </label>

        <select
          value={gender}
          onChange={(e) => onGenderChange(e.target.value)}
          className="rounded-lg border border-nutri-light-grey bg-nutri-white px-3 py-2 text-nutri-dark-grey shadow-sm"
        >
          <option value="all">Todos</option>
          <option value="M">Masculino</option>
          <option value="F">Femenino</option>
        </select>
      </div>
    </div>
  );
}
