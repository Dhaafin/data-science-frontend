import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Text } from "@/components/atoms";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Pagination — Navigation molecule for paginated data sets
 * DESIGN_GUIDELINES.md §3 (Sleek, transparent, Phosphor Icons)
 */
export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between w-full mt-4 pt-4 border-t border-(--color-border-default)">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-(--color-border-default) text-(--color-text-secondary) hover:text-(--color-text-primary) hover:border-(--color-accent-500)/50 hover:bg-(--color-bg-surface) disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <CaretLeft size={16} weight="bold" />
        <Text as="span" variant="caption" className="font-medium hidden sm:inline">Prev</Text>
      </button>

      <Text variant="caption" color="secondary" className="font-medium">
        Page <span className="text-(--color-text-primary)">{currentPage}</span> of{" "}
        <span className="text-(--color-text-primary)">{totalPages}</span>
      </Text>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-(--color-border-default) text-(--color-text-secondary) hover:text-(--color-text-primary) hover:border-(--color-accent-500)/50 hover:bg-(--color-bg-surface) disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <Text as="span" variant="caption" className="font-medium hidden sm:inline">Next</Text>
        <CaretRight size={16} weight="bold" />
      </button>
    </div>
  );
}
