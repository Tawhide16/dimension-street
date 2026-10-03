import { NextRequest, NextResponse } from "next/server";
import {
  findUserByEmail,
  createCustomerUser,
} from "@/lib/dataService";
import {
  hashPassword,
  createUserSessionToken,
  USER_COOKIE_NAME,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = (body.name || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const password = (body.password || "").trim();
    const phone = (body.phone || "").trim();

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Please enter your full name." },
        { status: 400 }
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "An account with this email already exists. Please sign in instead.",
        },
        { status: 409 }
      );
    }

    // Hash password & create user
    const hashedPassword = await hashPassword(password);
    const newUser = await createCustomerUser({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "customer",
    });

    // Create session token
    const token = await createUserSessionToken({
      id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      phone: newUser.phone,
      role: newUser.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    });

    response.cookies.set({
      name: USER_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error("User registration error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during registration." },
      { status: 500 }
    );
  }
}
