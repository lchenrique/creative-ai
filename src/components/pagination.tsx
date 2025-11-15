import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages?: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  loading?: boolean;
}

export const Pagination = ({
  currentPage,
  totalPages,
  canGoPrev,
  canGoNext,
  onPrevious,
  onNext,
  loading = false,
}: PaginationProps) => {
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={onPrevious}
        disabled={!canGoPrev || loading}
        className="h-8 w-8 p-0"
        title="Página anterior"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <div className="flex items-center gap-1 px-2">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Página
        </span>
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 min-w-[20px] text-center">
          {currentPage}
        </span>
        {totalPages && (
          <>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              de
            </span>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {totalPages}
            </span>
          </>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onNext}
        disabled={!canGoNext || loading}
        className="h-8 w-8 p-0"
        title="Próxima página"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};
