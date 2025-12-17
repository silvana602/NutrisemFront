"use client";

import { MdChevronLeft, MdChevronRight } from "react-icons/md";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  onChange,
}) => {
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4 py-2 pb-0">
      
      {/* Botón anterior */}
      <button
        onClick={() => canPrev && onChange(page - 1)}
        disabled={!canPrev}
        className="
          flex items-center justify-center
          w-8 h-8 sm:w-10 sm:h-10
          rounded-full border border-gray-300
          hover:bg-gray-200 transition
          disabled:opacity-40 disabled:cursor-not-allowed
        "
      >
        <MdChevronLeft size={20} className="sm:size-24" />
      </button>

      {/* Número de páginas */}
      <span
        className="
          text-xs sm:text-sm
          font-medium text-gray-700
        "
      >
        <span className="block sm:hidden">
          {page} / {totalPages}
        </span>
        <span className="hidden sm:block">
          Página {page} de {totalPages}
        </span>
      </span>

      {/* Botón siguiente */}
      <button
        onClick={() => canNext && onChange(page + 1)}
        disabled={!canNext}
        className="
          flex items-center justify-center
          w-8 h-8 sm:w-10 sm:h-10
          rounded-full border border-gray-300
          hover:bg-gray-200 transition
          disabled:opacity-40 disabled:cursor-not-allowed
        "
      >
        <MdChevronRight size={20} className="sm:size-24" />
      </button>
    </div>
  );
};
