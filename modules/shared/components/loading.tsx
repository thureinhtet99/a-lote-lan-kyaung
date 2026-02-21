import { cn } from "@/lib/utils";
import { ReactNode } from "react";

function Loading({ className }: { className?: ReactNode }) {
  return (
    <div
      className={cn("flex justify-center items-center space-x-2", className)}
    >
      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
      <span className="text-xs text-muted-foreground">Loading...</span>
    </div>
  );
}

export default Loading;
