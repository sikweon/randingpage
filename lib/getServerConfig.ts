import { LandingConfig } from "./types";
import { defaultConfig } from "./defaultConfig";

// Deduplicated fetch — Next.js automatically deduplicates fetch calls
// with the same URL and options within a single request lifecycle
export async function getServerConfig(): Promise<LandingConfig> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return defaultConfig;

    const res = await fetch(
      `${url}/rest/v1/landing_config?key=eq.main&select=value`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        next: { revalidate: 30 },
      }
    );

    if (!res.ok) return defaultConfig;
    const data = await res.json();
    if (data?.[0]?.value) return data[0].value;
    return defaultConfig;
  } catch {
    return defaultConfig;
  }
}
