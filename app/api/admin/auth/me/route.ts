import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, ADMIN_COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    return NextResponse.json(
      { success: false, authenticated: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    authenticated: true,
    user: {
      email: session.email,
      name: session.name,
      role: session.role,
    },
  });
}
