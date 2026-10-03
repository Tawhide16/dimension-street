import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AnnouncementBar from "@/components/store/AnnouncementBar";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import CustomerAuthPortal from "@/components/store/CustomerAuthPortal";
import AccountDashboard from "@/components/store/AccountDashboard";
import {
  verifyUserSessionToken,
  verifySessionToken,
  USER_COOKIE_NAME,
  ADMIN_COOKIE_NAME,
} from "@/lib/auth";
import { getOrdersByCustomerEmail, findUserByEmail } from "@/lib/dataService";

export const revalidate = 0;

export default async function AccountPage() {
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

  let session = null;
  if (token) {
    session = await verifyUserSessionToken(token);
  }

  let user = null;
  let customerOrders: any[] = [];

  if (session) {
    if (session.role === "admin" || session.role === "superadmin") {
      redirect("/admin");
    }

    const dbUser = await findUserByEmail(session.email);
    user = {
      id: dbUser?._id || session.id,
      name: dbUser?.name || session.name,
      email: session.email,
      phone: dbUser?.phone || session.phone || "",
      role: dbUser?.role || session.role,
    };

    if (user.role === "admin" || user.role === "superadmin") {
      redirect("/admin");
    }

    customerOrders = await getOrdersByCustomerEmail(session.email);
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Header />
      <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-10 md:py-14">
        {session && user ? (
          <AccountDashboard user={user} orders={customerOrders} />
        ) : (
          <CustomerAuthPortal initialMode="login" />
        )}
      </main>
      <Footer />
    </div>
  );
}
