import { NextRequest, NextResponse } from "next/server";
import { getAdminAnalytics } from "@/lib/dataService";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = (searchParams.get("period") as "7D" | "30D" | "ALL") || "ALL";
    const analytics = await getAdminAnalytics(period);
    return NextResponse.json({ success: true, analytics });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to compute analytics" }, { status: 500 });
  }
}
