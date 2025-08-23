import { Button } from "@/components/ui/button";
import {
  SignInButton as ClerkSignInButton,
  SignUpButton as ClerkSignUpButton,
  SignOutButton as ClerkSignOutButton,
} from "@clerk/nextjs";

export function SignInButton({
  children = <Button>Sign In</Button>,
  ...props
}) {
  return <ClerkSignInButton {...props}>{children}</ClerkSignInButton>;
}

export function SignUpButton({
  children = <Button>Sign Up</Button>,
  ...props
}) {
  return <ClerkSignUpButton {...props}>{children}</ClerkSignUpButton>;
}

export function SignOutButton({
  children = <Button>Sign Out</Button>,
  ...props
}) {
  return <ClerkSignOutButton {...props}>{children}</ClerkSignOutButton>;
}
