import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getHomepageSections,
  updateHomepageSection,
  saveAllHomepageSections,
} from "@/lib/dataService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sections = await getHomepageSections();
    return NextResponse.json({ success: true, sections });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch homepage sections" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, updates } = await req.json();
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Section ID is required" },
        { status: 400 }
      );
    }
    const section = await updateHomepageSection(id, updates);

    // Immediately purge homepage cache
    try {
      revalidatePath("/");
      revalidatePath("/", "layout");
    } catch {}

    return NextResponse.json({ success: true, section });
  } catch (error: any) {
    console.error("PATCH /api/cms/sections error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { sections } = await req.json();
    if (!Array.isArray(sections)) {
      return NextResponse.json(
        { success: false, error: "Sections array is required" },
        { status: 400 }
      );
    }
    const updated = await saveAllHomepageSections(sections);

    // Immediately purge homepage cache
    try {
      revalidatePath("/");
      revalidatePath("/", "layout");
    } catch {}

    return NextResponse.json({ success: true, sections: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to save sections" },
      { status: 500 }
    );
  }
}
