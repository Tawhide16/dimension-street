import { NextRequest, NextResponse } from "next/server";
import {
  getCommunityReels,
  addCommunityReel,
  deleteCommunityReel,
  toggleCommunityReelActive,
} from "@/lib/communityReelsService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const reels = getCommunityReels();
    return NextResponse.json({ success: true, reels });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch community reels" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, videoUrl, posterUrl, product, likes } = body;

    if (!videoUrl || !product?.name) {
      return NextResponse.json(
        { success: false, error: "Video URL and Product details are required" },
        { status: 400 }
      );
    }

    const newReel = addCommunityReel({
      title: title || product.name,
      videoUrl,
      posterUrl: posterUrl || "/images/review_green_hoodie.jpg",
      product: {
        id: product.id || `prod-${Date.now()}`,
        name: product.name,
        price: Number(product.price) || 0,
        slug: product.slug || "architectural-pullover-hoodie-480gsm",
        thumbnail: product.thumbnail || "/images/review_green_hoodie.jpg",
      },
      likes: Number(likes) || 1200,
      isActive: true,
    });

    return NextResponse.json({ success: true, reel: newReel }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create community reel" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Reel ID is required" },
        { status: 400 }
      );
    }

    const deleted = deleteCommunityReel(id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete reel" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Reel ID is required" },
        { status: 400 }
      );
    }

    const updated = toggleCommunityReelActive(id);
    return NextResponse.json({ success: !!updated, reel: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update reel" },
      { status: 500 }
    );
  }
}
