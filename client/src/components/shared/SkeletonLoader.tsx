import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  /** For accessibility - describes what's loading */
  ariaLabel?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className,
  ariaLabel = "Loading content"
}) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-slate-200 dark:bg-slate-700",
        className
      )}
      aria-label={ariaLabel}
      aria-busy="true"
      role="status"
    />
  );
};

export const TableRowSkeleton: React.FC<{rows?: number}> = ({ rows = 5 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <tr key={`skeleton-row-${index}`} className="animate-pulse">
          {Array.from({ length: 4 }).map((_, cellIndex) => (
            <td key={`skeleton-cell-${index}-${cellIndex}`} className="p-2">
              <Skeleton 
                className="h-6 w-full" 
                ariaLabel={`Loading row ${index + 1} cell ${cellIndex + 1}`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <Skeleton className="h-8 w-3/4 mb-4" ariaLabel="Loading card title" />
      <Skeleton className="h-32 w-full mb-4" ariaLabel="Loading card content" />
      <div className="flex justify-between">
        <Skeleton className="h-6 w-1/3" ariaLabel="Loading card footer left" />
        <Skeleton className="h-6 w-1/4" ariaLabel="Loading card footer right" />
      </div>
    </div>
  );
};

export const StatCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <Skeleton className="h-6 w-1/2 mb-2" ariaLabel="Loading statistic title" />
      <Skeleton className="h-10 w-3/4 mb-4" ariaLabel="Loading statistic value" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" ariaLabel="Loading statistic metric 1" />
        <Skeleton className="h-4 w-2/3" ariaLabel="Loading statistic metric 2" />
        <Skeleton className="h-4 w-5/6" ariaLabel="Loading statistic metric 3" />
      </div>
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <Skeleton className="h-8 w-1/2 mb-4" ariaLabel="Loading chart title" />
      <Skeleton className="h-60 w-full" ariaLabel="Loading chart content" />
    </div>
  );
};

export default Skeleton;