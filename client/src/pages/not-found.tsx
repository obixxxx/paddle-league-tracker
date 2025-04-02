import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function NotFound() {
  const [, navigate] = useLocation();

  const goBack = () => {
    window.history.length > 1 ? window.history.back() : navigate("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-4">
      <Card className="w-full max-w-md shadow-lg border-gray-200 dark:border-gray-800">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center mb-6">
            <AlertTriangle className="h-16 w-16 text-orange-500 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Page Not Found</h1>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4 pb-6">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={goBack}
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button className="flex items-center gap-2" asChild>
            <Link href="/">
              <Home className="h-4 w-4" />
              Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
