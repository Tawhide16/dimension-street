import { NextResponse } from "next/server";
import { connectToDatabase, isMongoConnected } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    const connected = isMongoConnected();
    return NextResponse.json({
      success: true,
      mongoConnected: connected,
      status: connected ? "connected" : "disconnected",
    });
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json({
      success: false,
      mongoConnected: false,
      status: "disconnected",
    });
  }
}
