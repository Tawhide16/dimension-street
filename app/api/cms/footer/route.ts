import { NextRequest, NextResponse } from "next/server";
import { getFooterConfig, updateFooterConfig } from "@/lib/dataService";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const config = await getFooterConfig();
    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error("GET /api/cms/footer error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch footer settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = await updateFooterConfig(body);

    // Invalidate Next.js cache so storefront updates immediately
    try {
      revalidatePath("/");
      revalidatePath("/admin/navigation");
      revalidatePath("/admin/footer");
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Footer configuration saved successfully",
      config: updated,
    });
  } catch (error: any) {
    console.error("PUT /api/cms/footer error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update footer settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return PUT(req);
}
