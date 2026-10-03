import { NextRequest, NextResponse } from "next/server";
import { bulkUpdateProducts, bulkDeleteProducts } from "@/lib/dataService";
import { revalidatePath } from "next/cache";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { ids, updates } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "Please select at least one product." },
        { status: 400 }
      );
    }

    const result = await bulkUpdateProducts(ids, updates || {});

    try {
      revalidatePath("/admin/products");
      revalidatePath("/shop");
      revalidatePath("/");
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${result.updatedCount} product(s).`,
      updatedCount: result.updatedCount,
    });
  } catch (error: any) {
    console.error("Bulk update error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to bulk update products." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "Please select at least one product." },
        { status: 400 }
      );
    }

    const result = await bulkDeleteProducts(ids);

    try {
      revalidatePath("/admin/products");
      revalidatePath("/shop");
      revalidatePath("/");
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} product(s).`,
      deletedCount: result.deletedCount,
    });
  } catch (error: any) {
    console.error("Bulk delete error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to bulk delete products." },
      { status: 500 }
    );
  }
}
