import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Only admins can access admin pages
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <a className="mr-6 flex items-center space-x-2" href="/admin">
              <span className="font-bold">Admin Dashboard</span>
            </a>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <a
                className="transition-colors hover:text-foreground/80"
                href="/admin"
              >
                Overview
              </a>
              <a
                className="transition-colors hover:text-foreground/80"
                href="/admin/users"
              >
                Users
              </a>
              <a
                className="transition-colors hover:text-foreground/80"
                href="/admin/employer-requests"
              >
                Employer Requests
              </a>
            </nav>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {session.user.name}
            </span>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
