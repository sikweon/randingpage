import { Metadata } from "next";
import { defaultConfig } from "@/lib/defaultConfig";
import LandingClient from "./LandingClient";
import CustomHead from "./CustomHead";

export const dynamic = "force-dynamic";

async function getConfig() {
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
        cache: "no-store",
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

export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig();
  const seo = config.seo;

  return {
    title: seo?.title || "콩즈쥬스",
    description: seo?.description || "당신의 일상에 특별한 경험을 더합니다",
    robots: "noindex, nofollow",
    openGraph: {
      title: seo?.ogTitle || seo?.title || "콩즈쥬스",
      description: seo?.ogDescription || seo?.description || "",
      images: seo?.ogImage ? [seo.ogImage] : [],
      url: seo?.ogUrl || "",
      type: (seo?.ogType as "website" | "article") || "website",
    },
  };
}

export default async function Page() {
  const config = await getConfig();
  const customHead = config.seo?.customHead || "";

  return (
    <>
      <CustomHead html={customHead} />
      <LandingClient />
    </>
  );
}
