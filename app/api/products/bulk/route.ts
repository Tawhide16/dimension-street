import { NextRequest, NextResponse } from "next/server";
import { bulkUpdateProducts, bulkDeleteProducts, createProduct } from "@/lib/dataService";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { products } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { success: false, error: "Please provide an array of products to create." },
        { status: 400 }
      );
    }

    const created = [];
    for (const p of products) {
      if (!p.name || !p.name.trim()) continue;
      const cleanName = p.name.trim();
      const slug =
        p.slug ||
        cleanName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") +
          "-" +
          Date.now().toString().slice(-4);
      const sku =
        p.sku ||
        `DIM-${Date.now().toString().slice(-5)}-${Math.floor(Math.random() * 900 + 100)}`;
      const price = Number(p.price) || 50;
      const totalStock = Number(p.totalStock) || 50;
      const images =
        Array.isArray(p.images) && p.images.length > 0
          ? p.images
          : p.image
          ? [p.image]
          : [
              "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85",
            ];

      const prodData = {
        name: cleanName,
        slug,
        sku,
        category: p.category || "t-shirts",
        collectionName: p.collectionName || "dimension-core",
        price,
        compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
        costPrice: p.costPrice ? Number(p.costPrice) : Math.round(price * 0.4),
        description: p.description || "",
        shortDescription: p.shortDescription || "",
        images,
        totalStock,
        variants: p.variants || [
          { sku: `${sku}-M`, color: "Pitch Black", size: "M", price, stock: Math.round(totalStock / 2) },
          { sku: `${sku}-L`, color: "Pitch Black", size: "L", price, stock: Math.round(totalStock / 2) },
        ],
        featured: Boolean(p.featured),
        bestSeller: Boolean(p.bestSeller),
        newArrival: p.newArrival !== undefined ? Boolean(p.newArrival) : true,
      };

      const newP = await createProduct(prodData);
      created.push(newP);
    }

    try {
      revalidatePath("/admin/products");
      revalidatePath("/shop");
      revalidatePath("/");
    } catch {}

    return NextResponse.json(
      {
        success: true,
        message: `Successfully created ${created.length} product(s).`,
        count: created.length,
        products: created,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Bulk create products error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to bulk create products." },
      { status: 500 }
    );
  }
}


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
