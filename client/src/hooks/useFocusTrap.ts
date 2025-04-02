import { useEffect, useRef, RefObject } from 'react';

interface UseFocusTrapOptions {
  active?: boolean;
  returnFocusOnDeactivate?: boolean;
}

/**
 * Hook for trapping focus within a container
 * Useful for modals, dialogs, and other components that should trap focus
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  options: UseFocusTrapOptions = {}
): RefObject<T> {
  const { active = true, returnFocusOnDeactivate = true } = options;
  const containerRef = useRef<T>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  // Save the currently focused element when the trap is activated
  useEffect(() => {
    if (active) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
    }
  }, [active]);

  // Handle trap focus within container
  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = Array.from(
      container.querySelectorAll<HTMLElement>(
        'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(
      (el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden')
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // If there are no focusable elements, focus the container itself
    if (!focusableElements.length) {
      container.setAttribute('tabindex', '-1');
      container.focus();
      return;
    }

    // Focus the first element when the trap is activated
    if (firstElement && !container.contains(document.activeElement)) {
      firstElement.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle Tab key presses
      if (event.key !== 'Tab') return;

      // Handle Tab navigation to keep focus trapped
      if (event.shiftKey) {
        // If shift+tab on first element, move to last
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // If tab on last element, move to first
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [active]);

  // Return focus when trap is deactivated
  useEffect(() => {
    return () => {
      if (returnFocusOnDeactivate && previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [returnFocusOnDeactivate]);

  return containerRef;
}

/**
 * Hook for managing focus locks that aren't in a modal dialog
 * For example, when a dropdown menu or popover is open
 */
export function useFocusLock<T extends HTMLElement = HTMLElement>(
  isOpen: boolean
): RefObject<T> {
  const containerRef = useRef<T>(null);
  
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    
    const container = containerRef.current;
    
    // Focus the container when opened
    container.focus();
    
    const handleKeyDown = (event: KeyboardEvent) => {
      // Close on Escape key
      if (event.key === 'Escape') {
        document.dispatchEvent(new CustomEvent('focuslock:close'));
      }
      
      // Don't trap Tab, just handle arrow navigation within component
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        // Let the component handle its own arrow navigation
        // This is intentionally left empty
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);
  
  return containerRef;
}