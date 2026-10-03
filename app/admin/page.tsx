import React from "react";
import RealtimeDashboard from "@/components/admin/RealtimeDashboard";
import { getAdminAnalytics } from "@/lib/dataService";

export const revalidate = 0;

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: "7D" | "30D" | "ALL" }>;
}) {
  const { period = "ALL" } = await searchParams;
  const analytics = await getAdminAnalytics(period);

  return (
    <RealtimeDashboard
      initialAnalytics={analytics}
      initialPeriod={period}
    />
  );
}
