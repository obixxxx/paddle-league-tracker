import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showControls?: boolean;
  showEdges?: boolean;
  maxVisible?: number;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showControls = true,
  showEdges = true,
  maxVisible = 5,
  className,
}) => {
  // No pagination needed for single page
  if (totalPages <= 1) return null;

  // Calculate visible page range
  const getPageNumbers = () => {
    if (totalPages <= maxVisible) {
      // If total pages is less than max visible, show all pages
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Half of the max visible pages (rounded down)
    const halfVisible = Math.floor(maxVisible / 2);
    
    // Start page calculation
    let startPage = Math.max(currentPage - halfVisible, 1);
    let endPage = Math.min(startPage + maxVisible - 1, totalPages);
    
    // Adjust if we're near the end
    if (endPage === totalPages) {
      startPage = Math.max(endPage - maxVisible + 1, 1);
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={cn('flex items-center justify-center space-x-2', className)}>
      {/* First page button */}
      {showEdges && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="First page"
          className="hidden sm:flex"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Previous button */}
      {showControls && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Show leading ellipsis if needed */}
      {pageNumbers[0] > 1 && (
        <Button
          variant="outline"
          size="icon"
          disabled
          className="cursor-default"
          aria-hidden="true"
        >
          ...
        </Button>
      )}

      {/* Page numbers */}
      {pageNumbers.map((pageNumber) => (
        <Button
          key={pageNumber}
          variant={pageNumber === currentPage ? 'default' : 'outline'}
          size="icon"
          onClick={() => onPageChange(pageNumber)}
          aria-label={`Page ${pageNumber}`}
          aria-current={pageNumber === currentPage ? 'page' : undefined}
        >
          {pageNumber}
        </Button>
      ))}

      {/* Show trailing ellipsis if needed */}
      {pageNumbers[pageNumbers.length - 1] < totalPages && (
        <Button
          variant="outline"
          size="icon"
          disabled
          className="cursor-default"
          aria-hidden="true"
        >
          ...
        </Button>
      )}

      {/* Next button */}
      {showControls && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* Last page button */}
      {showEdges && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Last page"
          className="hidden sm:flex"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default Pagination;