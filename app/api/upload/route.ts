import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded. Please select an image." },
        { status: 400 }
      );
    }

    // Validate mime type
    const mime = file.type || "";
    if (
      !mime.startsWith("image/") &&
      !file.name.match(/\.(jpg|jpeg|png|webp|svg|gif|avif)$/i)
    ) {
      return NextResponse.json(
        { success: false, error: "File must be an image (PNG, JPG, WEBP, SVG, GIF, AVIF)" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").toLowerCase();
    const uniqueFileName = `upload_${Date.now()}_${safeName}`;
    const filePath = path.join(uploadsDir, uniqueFileName);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFileName}`;
    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: uniqueFileName,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Image upload error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to save uploaded file." },
      { status: 500 }
    );
  }
}
