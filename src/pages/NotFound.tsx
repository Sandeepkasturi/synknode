import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/BrandMark";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md border border-border bg-card p-10 text-center">
        <BrandMark className="mx-auto mb-8" />
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Error 404</p>
        <h1 className="mb-3 mt-3 font-display text-4xl font-bold text-foreground">Node not found.</h1>
        <p className="mb-8 text-sm text-muted-foreground">The page you requested is outside this transfer route.</p>
        <Button asChild>
          <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Return home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
