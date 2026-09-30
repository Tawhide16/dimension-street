import { NextRequest, NextResponse } from "next/server";
import { getCoupons, createCoupon } from "@/lib/dataService";

export async function GET() {
  const coupons = await getCoupons();
  return NextResponse.json({ success: true, coupons });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const coupon = await createCoupon(body);
    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create coupon" }, { status: 500 });
  }
}
