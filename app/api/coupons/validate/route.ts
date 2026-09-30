import { NextRequest, NextResponse } from "next/server";
import { validateCoupon, getCoupons, createCoupon } from "@/lib/dataService";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const subtotal = Number(searchParams.get("subtotal")) || 0;

    if (!code) {
      const allCoupons = await getCoupons();
      return NextResponse.json({ success: true, coupons: allCoupons });
    }

    const result = await validateCoupon(code, subtotal);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: "Validation failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const coupon = await createCoupon(body);
    return NextResponse.json({ success: true, coupon }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create coupon" }, { status: 500 });
  }
}
