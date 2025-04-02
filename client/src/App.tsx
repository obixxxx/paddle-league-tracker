import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { PadelContextProvider } from "./hooks/usePadelContext";
import PadelDashboard from "./components/PadelDashboard";
import NotFound from "@/pages/not-found";
import ErrorBoundary from "./components/ErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { SkipLink, AnnouncePageChange, LiveRegion } from "@/components/shared/AccessibilityHelpers";
import { error as logErrorToService } from "@/lib/logger";

// Error logger function
const logError = (error: Error, errorInfo: React.ErrorInfo) => {
  logErrorToService("Application error:", {
    error: error.toString(),
    componentStack: errorInfo.componentStack
  });
  
  // In a production app, you would send this to a logging service
  // Example: sendToErrorLoggingService(error, errorInfo);
};

// Route titles for accessibility announcements
const routeTitles: Record<string, string> = {
  "/": "Padel Dashboard",
  "/players": "Players Management",
  "/matches": "Match History",
  "/partnerships": "Partnerships Overview"
};

function Router() {
  const { toast } = useToast();
  const [location] = useLocation();
  const pageTitle = routeTitles[location] || "Page Not Found";
  
  return (
    <ErrorBoundary 
      onError={(error) => {
        toast({
          title: "Something went wrong",
          description: error.message || "An unexpected error occurred",
          variant: "destructive",
        });
      }}
    >
      {/* Announce page changes to screen readers */}
      <AnnouncePageChange pageTitle={pageTitle} />
      
      {/* Live region for dynamic notifications */}
      <LiveRegion ariaLive="polite" id="notifications"></LiveRegion>
      
      <main id="main-content">
        <Switch>
          <Route path="/" component={PadelDashboard} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <>
      {/* Skip link for keyboard users */}
      <SkipLink targetId="main-content" />
      
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary onError={logError}>
          <PadelContextProvider>
            <Router />
            <Toaster />
          </PadelContextProvider>
        </ErrorBoundary>
      </QueryClientProvider>
    </>
  );
}

export default App;
