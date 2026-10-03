import { NextRequest, NextResponse } from "next/server";
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
} from "@/lib/dataService";

export const revalidate = 0;

export async function GET() {
  try {
    const collections = await getCollections();
    return NextResponse.json({ success: true, count: collections.length, collections });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch collections" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title) {
      return NextResponse.json(
        { success: false, error: "Collection title is required" },
        { status: 400 }
      );
    }

    const collection = await createCollection(body);
    return NextResponse.json({ success: true, collection }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create collection" },
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
        { success: false, error: "Collection ID is required for updating" },
        { status: 400 }
      );
    }

    const updated = await updateCollection(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Collection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, collection: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update collection" },
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
        { success: false, error: "Collection ID is required" },
        { status: 400 }
      );
    }

    const deleted = await deleteCollection(id);
    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete collection" },
      { status: 500 }
    );
  }
}
