import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Panel", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: LayoutProps<"/admin-lp">) {
  await requireAdmin();
  return <AdminShell>{children}</AdminShell>;
}
