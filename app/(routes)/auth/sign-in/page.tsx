import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import SignInForm from "./sign-in-form";
import { Logo } from "@/components/shared/logo";
import { FieldSeparator } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/constants/app-config";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex items-center justify-center">
          <Logo size="lg" />
        </CardHeader>
        <div className="flex flex-col gap-2 items-center justify-center">
          <Button
            variant="outline"
            type="button"
            className="max-w-sm cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            Login with Google
          </Button>
        </div>
        <CardContent>
          <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card mt-2 mb-4">
            Or continue with
          </FieldSeparator>
          <SignInForm />
          <div className="mt-6 text-center text-sm flex flex-col gap-3">
            <div className="text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href={APP_ROUTES.SIGN_UP}
                className="text-primary font-semibold hover:underline"
              >
                Sign up
              </Link>
            </div>
            <Link
              href={APP_ROUTES.FORGOT_PASSWORD}
              className="text-primary font-semibold hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
