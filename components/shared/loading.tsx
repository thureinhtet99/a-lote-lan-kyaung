import { cn } from "@/lib/utils";
import { ReactNode } from "react";

function Loading({ className }: { className?: ReactNode }) {
  return (
    <div
      className={cn("flex justify-center items-center space-x-2", className)}
    >
      <div className="size-5 animate-spin rounded-full border-2 border-blue-600 border-b-transparent"></div>
      <span className="text-xs text-muted-foreground">Loading....</span>
    </div>
  );
}

export default Loading;
