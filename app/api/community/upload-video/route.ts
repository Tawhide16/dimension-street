import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No video file provided" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${Date.now()}_${safeName}`;

    // Try local write if not Vercel serverless
    if (!process.env.VERCEL) {
      try {
        const uploadsDir = path.join(process.cwd(), "public", "uploads", "videos");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const filePath = path.join(uploadsDir, fileName);
        fs.writeFileSync(filePath, buffer);

        const videoUrl = `/uploads/videos/${fileName}`;
        return NextResponse.json({
          success: true,
          videoUrl,
          size: file.size,
          name: file.name,
        });
      } catch (fsErr) {
        console.warn("Local video write failed, falling back to data URL:", fsErr);
      }
    }

    // Serverless fallback: If video is <= 10MB, encode as base64 data URL
    if (file.size <= 10 * 1024 * 1024) {
      const mime = file.type || "video/mp4";
      const videoDataUrl = `data:${mime};base64,${buffer.toString("base64")}`;
      return NextResponse.json({
        success: true,
        videoUrl: videoDataUrl,
        size: file.size,
        name: file.name,
        isDataUrl: true,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Serverless environment filesystem is read-only. For videos larger than 10MB, please provide an external video link or cloud URL.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Video upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload video" },
      { status: 500 }
    );
  }
}
