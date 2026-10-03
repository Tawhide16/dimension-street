import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AnnouncementBar from "@/components/store/AnnouncementBar";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import CustomerAuthPortal from "@/components/store/CustomerAuthPortal";
import {
  verifyUserSessionToken,
  verifySessionToken,
  USER_COOKIE_NAME,
  ADMIN_COOKIE_NAME,
} from "@/lib/auth";

export const revalidate = 0;

export default async function CustomerLoginPage() {
  const cookieStore = await cookies();

  // If already authenticated as admin, redirect directly to /admin
  const adminToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (adminToken) {
    const adminSession = await verifySessionToken(adminToken);
    if (adminSession) {
      redirect("/admin");
    }
  }

  const token = cookieStore.get(USER_COOKIE_NAME)?.value;

  if (token) {
    const session = await verifyUserSessionToken(token);
    if (session) {
      if (session.role === "admin" || session.role === "superadmin") {
        redirect("/admin");
      }
      redirect("/account");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Header />
      <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-10 md:py-14">
        <CustomerAuthPortal initialMode="login" />
      </main>
      <Footer />
    </div>
  );
}
