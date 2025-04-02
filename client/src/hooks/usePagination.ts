import { useState, useEffect, useMemo } from 'react';

interface UsePaginationProps<T> {
  data: T[];
  itemsPerPage: number;
  initialPage?: number;
}

interface UsePaginationReturn<T> {
  currentPage: number;
  totalPages: number;
  paginatedData: T[];
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  setItemsPerPage: (count: number) => void;
}

export function usePagination<T>({
  data,
  itemsPerPage,
  initialPage = 1,
}: UsePaginationProps<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPageState, setItemsPerPageState] = useState(itemsPerPage);
  
  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(data.length / itemsPerPageState));
  }, [data.length, itemsPerPageState]);
  
  // Reset to first page when data or itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length, itemsPerPageState]);
  
  // Ensure current page is valid
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);
  
  // Extract current page data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPageState;
    const endIndex = startIndex + itemsPerPageState;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPageState]);
  
  // Navigation functions
  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  };
  
  const nextPage = () => {
    goToPage(currentPage + 1);
  };
  
  const prevPage = () => {
    goToPage(currentPage - 1);
  };
  
  const firstPage = () => {
    goToPage(1);
  };
  
  const lastPage = () => {
    goToPage(totalPages);
  };
  
  const setItemsPerPage = (count: number) => {
    setItemsPerPageState(Math.max(1, count));
  };
  
  return {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    setItemsPerPage,
  };
}

/**
 * Usage example:
 * 
 * const MyComponent = () => {
 *   const [allItems, setAllItems] = useState([...]);
 *   
 *   const {
 *     paginatedData,
 *     currentPage,
 *     totalPages,
 *     nextPage,
 *     prevPage,
 *   } = usePagination({
 *     data: allItems,
 *     itemsPerPage: 10,
 *   });
 *   
 *   return (
 *     <div>
 *       <ItemList items={paginatedData} />
 *       
 *       <div className="pagination">
 *         <button onClick={prevPage} disabled={currentPage === 1}>
 *           Previous
 *         </button>
 *         <span>Page {currentPage} of {totalPages}</span>
 *         <button onClick={nextPage} disabled={currentPage === totalPages}>
 *           Next
 *         </button>
 *       </div>
 *     </div>
 *   );
 * };
 */