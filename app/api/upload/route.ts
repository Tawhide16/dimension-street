import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

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
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").toLowerCase();
    const uniqueFileName = `upload_${Date.now()}_${safeName}`;

    // 1. In local development (non-Vercel), try saving to public/uploads
    if (!process.env.VERCEL) {
      try {
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadsDir, { recursive: true });
        const filePath = path.join(uploadsDir, uniqueFileName);
        await writeFile(filePath, buffer);

        const publicUrl = `/uploads/${uniqueFileName}`;
        return NextResponse.json({
          success: true,
          url: publicUrl,
          fileName: uniqueFileName,
        });
      } catch (fsErr) {
        console.warn("Local filesystem write failed, using serverless data URL fallback:", (fsErr as Error)?.message);
      }
    }

    // 2. Serverless / Vercel fallback: Convert to optimized WebP Data URI
    try {
      if (mime.includes("svg")) {
        // Preserve SVGs as vector data URI
        const svgBase64 = `data:image/svg+xml;base64,${buffer.toString("base64")}`;
        return NextResponse.json({
          success: true,
          url: svgBase64,
          fileName: uniqueFileName,
          isDataUrl: true,
        });
      }

      // Compress and resize image to prevent excessively large payload while keeping crisp quality
      const optimized = await sharp(buffer)
        .resize({
          width: 1920,
          height: 1920,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 80, effort: 4 })
        .toBuffer();

      const dataUrl = `data:image/webp;base64,${optimized.toString("base64")}`;
      return NextResponse.json({
        success: true,
        url: dataUrl,
        fileName: uniqueFileName,
        isDataUrl: true,
      });
    } catch (sharpErr) {
      console.warn("Sharp optimization failed, using raw base64 fallback:", sharpErr);
      const fallbackMime = mime || "image/jpeg";
      const rawDataUrl = `data:${fallbackMime};base64,${buffer.toString("base64")}`;
      return NextResponse.json({
        success: true,
        url: rawDataUrl,
        fileName: uniqueFileName,
        isDataUrl: true,
      });
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Image upload error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to process uploaded file." },
      { status: 500 }
    );
  }
}
