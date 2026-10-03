"use client";

import React from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <div suppressHydrationWarning>{children}</div>;
  }

  return (
    <div suppressHydrationWarning className="min-h-screen bg-[#F8F9FA] flex w-full">
      {/* CMS Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <AdminHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full min-w-0">{children}</main>
      </div>
    </div>
  );
}
