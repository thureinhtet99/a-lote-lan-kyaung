import { ApplicationStatusType } from "@/drizzle/schema";
import {
  CircleCheckIcon,
  CircleHelpIcon,
  CircleXIcon,
  HandshakeIcon,
  SpeechIcon,
} from "lucide-react";
import { ComponentPropsWithRef } from "react";

export default function StatusIcon({
  status,
  ...props
}: { status: ApplicationStatusType } & ComponentPropsWithRef<
  typeof CircleHelpIcon
>) {
  const Icon = getIcon(status);
  return <Icon {...props} />;
}

const getIcon = (status: ApplicationStatusType) => {
  switch (status) {
    case "applied":
      return CircleHelpIcon;
    case "interested":
      return CircleCheckIcon;
    case "denied":
      return CircleXIcon;
    case "interviewed":
      return SpeechIcon;
    case "hired":
      return HandshakeIcon;

    default:
      throw new Error(`Unknown application status ${status satisfies never}`);
  }
};
