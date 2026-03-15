import { Logo } from "@/components/shared/logo";
import { AdminNav } from "@/features/admin/components/admin-nav";
import { AdminUserMenu } from "@/features/admin/components/admin-user-menu";
import { safeGetSession } from "@/lib/auth/auth-helpers";
import { redirect } from "next/navigation";
import { ReactNode, Suspense } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense>
        <AdminAccessGuard />
      </Suspense>
      <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-primary to-accent px-3 sm:px-4">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 py-2 md:h-16 md:grid-cols-[auto_1fr_auto] md:gap-x-6 md:gap-y-0 md:py-0">
          <div className="min-w-0">
            <div className="md:hidden">
              <Logo showText={false} size="sm" />
            </div>
            <div className="hidden md:block">
              <Logo size="md" />
            </div>
          </div>
          <div className="justify-self-end md:col-start-3 md:row-start-1">
            <Suspense
              fallback={<div className="h-9 w-9 rounded-full bg-white/25" />}
            >
              <AdminUserMenuSlot />
            </Suspense>
          </div>
          <div className="col-span-2 min-w-0 border-t pt-2 md:col-span-1 md:col-start-2 md:row-start-1 md:border-t-0 md:pt-0">
            <AdminNav />
          </div>
        </div>
      </header>
      <main className="flex-1 bg-muted/30">{children}</main>
    </div>
  );
}

const AdminAccessGuard = async () => {
  const session = await safeGetSession();
  if (!session?.user || session.user.role !== "admin") redirect("/");
  return null;
};

const AdminUserMenuSlot = async () => {
  const session = await safeGetSession();
  if (!session?.user) return null;
  return <AdminUserMenu user={session.user} />;
};
