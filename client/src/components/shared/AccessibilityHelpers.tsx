import React from 'react';

/**
 * VisuallyHidden component allows screen readers to read content
 * but hides it visually from sighted users.
 */
export const VisuallyHidden: React.FC<{
  children: React.ReactNode;
  as?: React.ElementType;
  className?: string;
}> = ({ children, as: Component = 'span', className = '', ...props }) => {
  return (
    <Component
      className={`absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 ${className}`}
      style={{
        clip: 'rect(0, 0, 0, 0)',
      }}
      {...props}
    >
      {children}
    </Component>
  );
};

/**
 * A component that announces messages to screen readers
 * without visually displaying them.
 */
export const LiveRegion: React.FC<{
  children?: React.ReactNode;
  ariaLive?: 'polite' | 'assertive' | 'off';
  ariaAtomic?: boolean;
  ariaBusy?: boolean;
  ariaRelevant?: 'additions' | 'removals' | 'text' | 'all';
  id?: string; // Added id property
}> = ({
  children,
  ariaLive = 'polite',
  ariaAtomic = true,
  ariaBusy = false,
  ariaRelevant,
  id,
}) => {
  return (
    <div
      id={id}
      aria-live={ariaLive}
      aria-atomic={ariaAtomic}
      aria-busy={ariaBusy}
      aria-relevant={ariaRelevant}
      className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0"
      style={{
        clip: 'rect(0, 0, 0, 0)',
      }}
    >
      {children}
    </div>
  );
};

/**
 * SkipLink provides keyboard users a way to skip directly to the main content.
 * This component should be placed at the very top of the page.
 */
export const SkipLink: React.FC<{
  targetId: string;
  className?: string;
  children?: React.ReactNode;
}> = ({ targetId, className = '', children = 'Skip to main content' }) => {
  return (
    <a
      href={`#${targetId}`}
      className={`sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-2 focus:bg-white focus:text-black focus:rounded focus:outline-none focus:shadow ${className}`}
    >
      {children}
    </a>
  );
};

/**
 * AnnouncePageChange announces page changes to screen readers
 * This is particularly useful for single-page applications
 */
export const AnnouncePageChange: React.FC<{
  pageTitle: string;
}> = ({ pageTitle }) => {
  const [announcement, setAnnouncement] = React.useState('');

  React.useEffect(() => {
    if (pageTitle) {
      setAnnouncement(`Navigated to ${pageTitle}`);
      
      // Clear announcement after it's been read by screen readers
      const timer = setTimeout(() => {
        setAnnouncement('');
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [pageTitle]);

  return (
    <LiveRegion ariaLive="assertive">
      {announcement}
    </LiveRegion>
  );
};