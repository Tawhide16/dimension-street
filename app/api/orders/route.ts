import { NextRequest, NextResponse } from "next/server";
import { getOrders, createOrder } from "@/lib/dataService";

export async function GET() {
  try {
    const orders = await getOrders();
    return NextResponse.json({ success: true, count: orders.length, orders });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.customer?.name || !body.customer?.email || !body.customer?.phone) {
      return NextResponse.json(
        { success: false, error: "Customer name, email, and phone are required." },
        { status: 400 }
      );
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order must contain at least one item." },
        { status: 400 }
      );
    }

    if (!body.shippingAddress?.street || !body.shippingAddress?.city) {
      return NextResponse.json(
        { success: false, error: "Shipping address is incomplete." },
        { status: 400 }
      );
    }

    const order = await createOrder({
      customer: body.customer,
      items: body.items,
      shippingAddress: body.shippingAddress,
      paymentMethod: body.paymentMethod || "cod",
      couponCode: body.couponCode,
      notes: body.notes,
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to process order checkout." },
      { status: 500 }
    );
  }
}
