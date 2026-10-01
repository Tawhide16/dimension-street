import { NextRequest, NextResponse } from "next/server";
import { getReviews, createReview } from "@/lib/dataService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId") || undefined;
    const reviews = await getReviews(productId);

    return NextResponse.json({
      success: true,
      reviews,
      count: reviews.length,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      productId,
      productName,
      productSlug,
      customerName,
      customerEmail,
      rating,
      title,
      comment,
      image,
    } = body;

    if (!customerName || !comment) {
      return NextResponse.json(
        { success: false, error: "Name and review comment are required." },
        { status: 400 }
      );
    }

    const numericRating = Math.max(1, Math.min(5, Number(rating) || 5));

    const newReview = await createReview({
      productId: productId || "",
      productName: productName || "",
      productSlug: productSlug || "",
      customerName: customerName.trim(),
      customerEmail: customerEmail ? customerEmail.trim() : "",
      rating: numericRating,
      title: title ? title.trim() : "Verified Customer Review",
      comment: comment.trim(),
      image: image || undefined,
      verifiedPurchase: true,
      status: "Approved",
    });

    return NextResponse.json(
      {
        success: true,
        review: newReview,
        message: "Review submitted successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit review" },
      { status: 500 }
    );
  }
}
