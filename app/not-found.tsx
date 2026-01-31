import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="h-screen flex flex-col gap-4 items-center justify-center">
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
      <Button type="button" asChild>
        <Link href="/">Return home</Link>
      </Button>
    </div>
  );
}
