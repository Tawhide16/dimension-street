import { NextRequest, NextResponse } from "next/server";
import { getThemeConfig, updateThemeConfig } from "@/lib/dataService";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await getThemeConfig();
    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    console.error("GET /api/cms/theme error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch theme configuration" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = await updateThemeConfig(body);

    // Invalidate Next.js cache so storefront updates
    try {
      revalidatePath("/");
      revalidatePath("/admin/theme");
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Theme configuration saved successfully",
      config: updated,
    });
  } catch (error: any) {
    console.error("PUT /api/cms/theme error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update theme configuration" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return PUT(req);
}

