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
    <div className="flex items-center justify-center gap-3 py-2 sm:gap-4">
      <button
        type="button"
        onClick={() => canPrev && onChange(page - 1)}
        disabled={!canPrev}
        className="
          flex h-9 w-9 items-center justify-center
          rounded-full border border-nutri-light-grey
          text-nutri-dark-grey transition hover:bg-nutri-off-white
          disabled:cursor-not-allowed disabled:opacity-40
          sm:h-10 sm:w-10
        "
      >
        <MdChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      <span className="text-xs font-medium text-nutri-dark-grey sm:text-sm">
        <span className="block sm:hidden">
          {page} / {totalPages}
        </span>
        <span className="hidden sm:block">
          Pagina {page} de {totalPages}
        </span>
      </span>

      <button
        type="button"
        onClick={() => canNext && onChange(page + 1)}
        disabled={!canNext}
        className="
          flex h-9 w-9 items-center justify-center
          rounded-full border border-nutri-light-grey
          text-nutri-dark-grey transition hover:bg-nutri-off-white
          disabled:cursor-not-allowed disabled:opacity-40
          sm:h-10 sm:w-10
        "
      >
        <MdChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
    </div>
  );
};

