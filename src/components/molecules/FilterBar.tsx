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
      <div className="flex w-full flex-col sm:w-auto">
        <label className="mb-1 text-sm font-semibold text-nutri-dark-grey">Edad</label>

        <select
          value={age}
          onChange={(event) => onAgeChange(event.target.value)}
          className="nutri-input w-full sm:min-w-[160px]"
        >
          <option value="all">Todos</option>
          <option value="6-11m">6 - 11 meses</option>
          <option value="12-23m">12 - 23 meses</option>
          <option value="24-35m">24 - 35 meses</option>
          <option value="36-47m">36 - 47 meses</option>
          <option value="48-60m">48 - 60 meses</option>
        </select>
      </div>

      <div className="flex w-full flex-col sm:w-auto">
        <label className="mb-1 text-sm font-semibold text-nutri-dark-grey">Sexo</label>

        <select
          value={gender}
          onChange={(event) => onGenderChange(event.target.value)}
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
