import { NextRequest, NextResponse } from "next/server";
import { getSeoConfig, updateSeoConfig } from "@/lib/dataService";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await getSeoConfig();
    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error("GET /api/seo error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch SEO configuration" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = await updateSeoConfig(body);

    // Revalidate paths that use SEO metadata
    try {
      revalidatePath("/");
      revalidatePath("/shop");
      revalidatePath("/admin/seo");
    } catch {}

    return NextResponse.json({
      success: true,
      message: "SEO configuration updated successfully",
      config: updated,
    });
  } catch (error: any) {
    console.error("PUT /api/seo error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update SEO configuration" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return PUT(req);
}
