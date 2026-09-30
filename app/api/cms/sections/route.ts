import { NextRequest, NextResponse } from "next/server";
import { getHomepageSections, updateHomepageSection } from "@/lib/dataService";

export async function GET() {
  const sections = await getHomepageSections();
  return NextResponse.json({ success: true, sections });
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, updates } = await req.json();
    const section = await updateHomepageSection(id, updates);
    return NextResponse.json({ success: true, section });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update section" }, { status: 500 });
  }
}
