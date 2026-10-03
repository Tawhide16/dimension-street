import AdminLayoutShell from "@/components/admin/AdminLayoutShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin CMS — DIMENSION STREET",
  description: "Live storefront selling analytics & management dashboard",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
