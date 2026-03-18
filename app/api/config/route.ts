import { NextRequest, NextResponse } from "next/server";
import { defaultConfig } from "@/lib/defaultConfig";
import { LandingConfig } from "@/lib/types";

export const dynamic = "force-dynamic";

function getSupabaseInfo() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const configured = url.startsWith("http://") || url.startsWith("https://");
  return { url, key, configured };
}

export async function GET() {
  try {
    const sb = getSupabaseInfo();
    if (sb.configured) {
      const res = await fetch(
        `${sb.url}/rest/v1/landing_config?key=eq.main&select=value`,
        {
          headers: {
            apikey: sb.key,
            Authorization: `Bearer ${sb.key}`,
            Accept: "application/vnd.pgrst.object+json",
          },
          cache: "no-store",
        }
      );

      if (res.ok) {
        const data = await res.json();
        if (data?.value) {
          return NextResponse.json(data.value as LandingConfig);
        }
      }
    }

    return NextResponse.json(defaultConfig);
  } catch {
    return NextResponse.json(defaultConfig);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const password = request.headers.get("x-admin-password");
    const adminPassword = process.env.ADMIN_PASSWORD || "zhdwmzhdwm23";

    if (password !== adminPassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config: LandingConfig = await request.json();
    const sb = getSupabaseInfo();

    if (sb.configured) {
      const res = await fetch(
        `${sb.url}/rest/v1/landing_config?key=eq.main`,
        {
          method: "PATCH",
          headers: {
            apikey: sb.key,
            Authorization: `Bearer ${sb.key}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            value: config,
            updated_at: new Date().toISOString(),
          }),
        }
      );

      if (!res.ok) {
        // Try insert if update failed
        const insertRes = await fetch(
          `${sb.url}/rest/v1/landing_config`,
          {
            method: "POST",
            headers: {
              apikey: sb.key,
              Authorization: `Bearer ${sb.key}`,
              "Content-Type": "application/json",
              Prefer: "resolution=merge-duplicates,return=minimal",
            },
            body: JSON.stringify({
              key: "main",
              value: config,
              updated_at: new Date().toISOString(),
            }),
          }
        );

        if (!insertRes.ok) {
          const err = await insertRes.text();
          return NextResponse.json(
            { error: "Failed to save", detail: err },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to save", detail: String(err) },
      { status: 500 }
    );
  }
}
