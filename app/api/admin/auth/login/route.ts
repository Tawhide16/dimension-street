import { NextRequest, NextResponse } from "next/server";
import {
  validateAdminCredentials,
  createSessionToken,
  ADMIN_COOKIE_NAME,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const { isValid, user } = validateAdminCredentials(email, password);

    if (!isValid || !user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password. Please check your credentials." },
        { status: 401 }
      );
    }

    const durationDays = rememberMe ? 30 : 7;
    const token = await createSessionToken(
      {
        email: user.email,
        name: user.name,
        role: user.role,
      },
      durationDays
    );

    const response = NextResponse.json({
      success: true,
      message: "Admin authenticated successfully",
      user,
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: durationDays * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error("POST /api/admin/auth/login error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication server error" },
      { status: 500 }
    );
  }
}
