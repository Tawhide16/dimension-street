import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, ADMIN_COOKIE_NAME } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Protect Admin UI Pages
  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";
    const sessionToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const session = await verifySessionToken(sessionToken);

    // If on login page and already logged in, redirect to /admin
    if (isLoginPage) {
      if (session) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return NextResponse.next();
    }

    // If on any protected admin page without valid session, redirect to login
    if (!session) {
      const loginUrl = new URL("/admin/login", req.url);
      const destination = pathname + (search || "");
      loginUrl.searchParams.set("from", destination);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // Protect Admin Internal APIs (except auth endpoints and health check)
  if (pathname.startsWith("/api/admin")) {
    if (pathname.startsWith("/api/admin/auth") || pathname === "/api/admin/health") {
      return NextResponse.next();
    }

    const sessionToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const session = await verifySessionToken(sessionToken);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin session required" },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
