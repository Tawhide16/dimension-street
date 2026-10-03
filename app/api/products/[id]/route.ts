import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug, updateProduct, deleteProduct } from "@/lib/dataService";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);
    const product = await getProductBySlug(decodedId);
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, product });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Error fetching product" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);
    const body = await req.json();
    const updated = await updateProduct(decodedId, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    try {
      revalidatePath("/admin/products");
      revalidatePath("/shop");
      revalidatePath("/");
    } catch {}

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Error updating product" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);
    const success = await deleteProduct(decodedId);

    try {
      revalidatePath("/admin/products");
      revalidatePath("/shop");
      revalidatePath("/");
    } catch {}

    return NextResponse.json({ success, message: "Product deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Error deleting product" },
      { status: 500 }
    );
  }
}
