import React from "react";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
  animated?: boolean;
}

export const BrandMark: React.FC<BrandMarkProps> = ({ className, animated = true }) => (
  <div className={cn("brand-mark", animated && "brand-mark--animated", className)} aria-hidden="true">
    <span className="brand-mark__node brand-mark__node--start" />
    <span className="brand-mark__rail" />
    <span className="brand-mark__packet" />
    <span className="brand-mark__node brand-mark__node--end" />
  </div>
);