import { NextRequest, NextResponse } from "next/server";
import { findUserWithPassword } from "@/lib/dataService";
import {
  comparePassword,
  createUserSessionToken,
  createSessionToken,
  validateAdminCredentials,
  USER_COOKIE_NAME,
  ADMIN_COOKIE_NAME,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();
    const password = (body.password || "").trim();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    // 1. Check if matching admin credentials
    const adminCheck = validateAdminCredentials(email, password);
    if (adminCheck.isValid && adminCheck.user) {
      const adminToken = await createSessionToken({
        email: adminCheck.user.email,
        name: adminCheck.user.name,
        role: adminCheck.user.role,
      }, 30);

      const userToken = await createUserSessionToken({
        id: "usr-admin",
        email: adminCheck.user.email,
        name: adminCheck.user.name,
        role: adminCheck.user.role,
      }, 30);

      const response = NextResponse.json({
        success: true,
        isAdmin: true,
        redirectTo: "/admin",
        user: {
          id: "usr-admin",
          name: adminCheck.user.name,
          email: adminCheck.user.email,
          role: adminCheck.user.role,
        },
      });

      response.cookies.set({
        name: ADMIN_COOKIE_NAME,
        value: adminToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });

      response.cookies.set({
        name: USER_COOKIE_NAME,
        value: userToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });

      return response;
    }

    // 2. Regular user check
    const user = await findUserWithPassword(email);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    let isValid = false;
    if (user.password) {
      if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$") || user.password.startsWith("$2y$")) {
        isValid = await comparePassword(password, user.password);
      } else {
        isValid = user.password === password;
      }
    } else {
      isValid = true;
    }

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isAdminUser = user.role === "admin" || user.role === "superadmin";

    // Create session token
    const token = await createUserSessionToken({
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      isAdmin: isAdminUser,
      redirectTo: isAdminUser ? "/admin" : undefined,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
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

    if (isAdminUser) {
      const adminToken = await createSessionToken({
        email: user.email,
        name: user.name,
        role: user.role === "admin" ? "admin" : "superadmin",
      }, 30);

      response.cookies.set({
        name: ADMIN_COOKIE_NAME,
        value: adminToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (error) {
    console.error("User login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during login." },
      { status: 500 }
    );
  }
}
