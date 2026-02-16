import { redirect } from "next/navigation";
import { AdminNav } from "@/components/shared/admin-nav";
import { AdminUserMenu } from "@/components/shared/admin-user-menu";
import { Logo } from "@/components/shared/logo";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Only admins can access admin pages
  if (!session?.user || session?.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 px-4 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-center">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-20">
            <Logo />
            <AdminNav />
          </div>
          <AdminUserMenu user={session?.user} />
        </div>
      </header>
      <main className="flex-1 bg-muted/30">{children}</main>
    </div>
  );
}
