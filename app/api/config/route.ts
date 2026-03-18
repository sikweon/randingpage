import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { defaultConfig } from "@/lib/defaultConfig";
import { LandingConfig } from "@/lib/types";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const LOCAL_CONFIG_PATH = path.join(process.cwd(), "data", "config.json");

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  return url.startsWith("http://") || url.startsWith("https://");
}

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("landing_config")
        .select("value")
        .eq("key", "main")
        .single();

      if (!error && data) {
        return NextResponse.json(data.value as LandingConfig);
      }
    }

    // Fallback: read local file
    if (fs.existsSync(LOCAL_CONFIG_PATH)) {
      const raw = fs.readFileSync(LOCAL_CONFIG_PATH, "utf-8");
      return NextResponse.json(JSON.parse(raw));
    }

    return NextResponse.json(defaultConfig);
  } catch {
    return NextResponse.json(defaultConfig);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const password = request.headers.get("x-admin-password");
    const adminPassword = process.env.ADMIN_PASSWORD || "zhdwmzhdwm!23";

    if (password !== adminPassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config: LandingConfig = await request.json();

    if (isSupabaseConfigured()) {
      const supabase = getSupabase();

      // Try update first
      const { error: updateError } = await supabase
        .from("landing_config")
        .update({ value: config, updated_at: new Date().toISOString() })
        .eq("key", "main");

      // If update failed, try upsert
      if (updateError) {
        const { error: upsertError } = await supabase
          .from("landing_config")
          .upsert({
            key: "main",
            value: config,
            updated_at: new Date().toISOString(),
          });

        if (upsertError) {
          return NextResponse.json(
            { error: "Failed to save", detail: upsertError.message },
            { status: 500 }
          );
        }
      }
    } else {
      // Fallback: write to local file
      const dir = path.dirname(LOCAL_CONFIG_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(LOCAL_CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to save", detail: String(err) },
      { status: 500 }
    );
  }
}
