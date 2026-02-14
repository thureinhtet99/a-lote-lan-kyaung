import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import Link from "next/link";
import SignUpForm from "./sign-up-form";
import { APP_CONFIG, APP_ROUTES } from "@/config/app-config";
import { Logo } from "@/components/shared/logo";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
          <CardDescription>
            Start your career journey in {APP_CONFIG.APP_NAME}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm />
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href={APP_ROUTES.SIGN_IN}
              className="text-primary font-semibold hover:underline"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
