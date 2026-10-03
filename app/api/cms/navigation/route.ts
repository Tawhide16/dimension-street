import { NextRequest, NextResponse } from "next/server";
import { getNavbarConfig, updateNavbarConfig } from "@/lib/dataService";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const config = await getNavbarConfig();
    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error("GET /api/cms/navigation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch navigation settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = await updateNavbarConfig(body);

    // Invalidate Next.js cache so storefront updates immediately
    try {
      revalidatePath("/");
      revalidatePath("/admin/navigation");
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Navbar configuration saved successfully",
      config: updated,
    });
  } catch (error: any) {
    console.error("PUT /api/cms/navigation error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update navigation settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return PUT(req);
}
