import { APP_CONFIG } from "@/config/appConfig";
import { cn } from "@/lib/utils";
import { BriefcaseBusiness } from "lucide-react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

const textSizes = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-4xl",
};

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <BriefcaseBusiness className="shrink-0 size-12" />

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col leading-tight overflow-hidden transition-all duration-300 ease-in-out group-data-[state=collapsed]:w-0 group-data-[state=collapsed]:opacity-0">
          <span
            className={cn(
              "font-bold text-primary whitespace-nowrap",
              textSizes[size],
            )}
          >
            {APP_CONFIG.APP_NAME}
          </span>
        </div>
      )}
    </div>
  );
}

export function LogoIcon({
  className,
  size = "md",
}: Omit<LogoProps, "showText">) {
  return <Logo className={className} size={size} showText={false} />;
}
