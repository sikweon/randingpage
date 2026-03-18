import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  return url.startsWith("http://") || url.startsWith("https://");
}

export async function POST(request: NextRequest) {
  try {
    const password = request.headers.get("x-admin-password");
    const adminPassword = process.env.ADMIN_PASSWORD || "zhdwmzhdwm!23";

    if (password !== adminPassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    if (isSupabaseConfigured()) {
      const supabase = getSupabase();

      const { error } = await supabase.storage
        .from("landing-images")
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
      }

      const { data: urlData } = supabase.storage
        .from("landing-images")
        .getPublicUrl(fileName);

      return NextResponse.json({ url: urlData.publicUrl });
    } else {
      // Fallback: save to public/images locally
      const dir = path.join(process.cwd(), "public", "images");
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(path.join(dir, fileName), Buffer.from(buffer));
      return NextResponse.json({ url: `/images/${fileName}` });
    }
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
