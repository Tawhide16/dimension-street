import { NextRequest, NextResponse } from "next/server";
import { verifyUserSessionToken, USER_COOKIE_NAME } from "@/lib/auth";
import { findUserByEmail } from "@/lib/dataService";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(USER_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const session = await verifyUserSessionToken(token);
    if (!session) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const user = await findUserByEmail(session.email);
    if (!user) {
      // User might be only in token
      return NextResponse.json({
        success: true,
        user: {
          id: session.id,
          name: session.name,
          email: session.email,
          phone: session.phone || "",
          role: session.role,
        },
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Auth check failed" }, { status: 500 });
  }
}
