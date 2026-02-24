import { APP_CONFIG } from "@/constants/app-config";
import { cn } from "@/lib/utils";
import { LogoType } from "@/types/index.type";
import { BriefcaseBusiness } from "lucide-react";

const textSizes = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-4xl",
};

export function Logo({ className, size = "md", showText = true }: LogoType) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4 group-data-[state=collapsed]:gap-0 transition-all duration-300 ease-in-out",
        className,
      )}
    >
      <BriefcaseBusiness className="shrink-0 size-10 group-data-[state=collapsed]:size-8 transition-all duration-300 ease-in-out" />

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
}: Omit<LogoType, "showText">) {
  return <Logo className={className} size={size} showText={false} />;
}
