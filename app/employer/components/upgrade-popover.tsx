import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { APP_ROUTES } from "@/config/appConfig";
import Link from "next/link";
import { ReactNode } from "react";

export default function UpgradePopOver({
  buttonText,
  popOverText,
}: {
  buttonText: ReactNode;
  popOverText: ReactNode;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="cursor-pointer" variant="outline">
          {buttonText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-2">
        {popOverText}
        <Button asChild>
          <Link href={APP_ROUTES.EMPLOYER.PRICING}>Upgrade Plan</Link>
        </Button>
      </PopoverContent>
    </Popover>
  );
}
