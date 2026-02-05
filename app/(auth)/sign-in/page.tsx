import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import SignInForm from "./sign-in-form";
import { APP_ROUTES } from "@/config/appConfig";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription>
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignInForm />
          <div className="mt-4 text-center text-sm flex flex-col">
            <div>
              Don&apos;t have an account?{" "}
              <Link href={APP_ROUTES.SIGN_UP} className="hover:underline">
                Sign up
              </Link>
            </div>
            <Link
              href={APP_ROUTES.FORGOT_PASSWORD}
              className="hover:underline mt-4"
            >
              Forgot your password?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
