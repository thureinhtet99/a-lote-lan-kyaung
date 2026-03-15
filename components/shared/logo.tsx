import { APP_CONFIG, APP_ROUTES } from "@/constants/app-config";
import { cn } from "@/lib/utils";
import { LogoType } from "@/types/index.type";
import { BriefcaseBusiness } from "lucide-react";
import Link from "next/link";

const textSizes = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-4xl",
};

export function Logo({ className, size = "md", showText = true }: LogoType) {
  return (
    <Link
      href={APP_ROUTES.HOME}
      className={cn(
        "flex items-center justify-center gap-4 group-data-[state=collapsed]:gap-0 transition-all duration-300 ease-in-out cursor-pointer text-white",
        className,
      )}
    >
      <BriefcaseBusiness className="shrink-0 size-10 group-data-[state=collapsed]:size-8 transition-all duration-300 ease-in-out" />

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col leading-tight overflow-hidden transition-all duration-300 ease-in-out group-data-[state=collapsed]:w-0 group-data-[state=collapsed]:opacity-0">
          <span className={cn("font-bold whitespace-nowrap", textSizes[size])}>
            {APP_CONFIG.APP_NAME}
          </span>
        </div>
      )}
    </Link>
  );
}
