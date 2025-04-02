import { useState, useEffect } from 'react';

/**
 * Hook to detect if the viewport is mobile-sized
 * Returns true for screens under 768px width (typical tablet portrait breakpoint)
 */
export function useIsMobile() {
  // Default to desktop for SSR
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Function to check if screen size is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check on mount
    checkMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);

    // Clean up event listener on unmount
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

/**
 * Usage example:
 * 
 * const MyComponent = () => {
 *   const isMobile = useIsMobile();
 *   
 *   return (
 *     <div>
 *       {isMobile ? (
 *         <MobileLayout />
 *       ) : (
 *         <DesktopLayout />
 *       )}
 *     </div>
 *   );
 * };
 */