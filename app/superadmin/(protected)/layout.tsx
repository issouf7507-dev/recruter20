import type { Metadata } from "next";
import { IconShieldLock } from "@tabler/icons-react";
import { requireSuperAdmin } from "@/lib/superadmin";
import { SuperadminNav } from "@/components/superadmin/superadmin-nav";
import { SuperadminUserMenu } from "@/components/superadmin/superadmin-user-menu";

export const metadata: Metadata = {
  title: "Super Admin",
  robots: { index: false, follow: false },
};

export default async function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Chaque page re-vérifie aussi le flag : le layout ne se re-rend pas
  // lors des navigations client entre pages sœurs
  const user = await requireSuperAdmin();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-2 font-semibold">
            <IconShieldLock className="size-5 text-primary" />
            <span>Ylsix — Super Admin</span>
          </div>
          <SuperadminNav />
          <SuperadminUserMenu email={user.email} />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
