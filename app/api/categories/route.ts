import { NextRequest, NextResponse } from "next/server";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/dataService";

export const revalidate = 0;

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ success: true, count: categories.length, categories });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 }
      );
    }

    const category = await createCategory(body);
    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create category" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body._id || body.id;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Category ID is required for updating" },
        { status: 400 }
      );
    }

    const updated = await updateCategory(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, category: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update category" },
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
        { success: false, error: "Category ID is required" },
        { status: 400 }
      );
    }

    const deleted = await deleteCategory(id);
    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
