import { NextRequest, NextResponse } from "next/server";
import { getProducts, createProduct } from "@/lib/dataService";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const collection = searchParams.get("collection") || undefined;
    const search = searchParams.get("search") || undefined;
    const sort = searchParams.get("sort") || undefined;
    const featured = searchParams.get("featured") === "true";
    const bestSeller = searchParams.get("bestSeller") === "true";
    const newArrival = searchParams.get("newArrival") === "true";

    const products = await getProducts({
      category,
      collection,
      search,
      sort,
      featured,
      bestSeller,
      newArrival,
    });

    return NextResponse.json({ success: true, count: products.length, products });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newProduct = await createProduct(body);
    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 }
    );
  }
}
