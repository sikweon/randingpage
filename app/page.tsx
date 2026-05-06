import { Metadata } from "next";
import { getServerConfig } from "@/lib/getServerConfig";
import LandingClient from "./LandingClient";
import CustomHead from "./CustomHead";

export const dynamic = "force-dynamic";

const TRACKING_KEYS = [
  "fbclid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "utm_id",
];

function extractTracking(
  searchParams: Record<string, string | string[] | undefined>
): Record<string, string> {
  const tracking: Record<string, string> = {};
  for (const key of TRACKING_KEYS) {
    const v = searchParams[key];
    if (typeof v === "string" && v) tracking[key] = v;
  }
  return tracking;
}

export async function generateMetadata(): Promise<Metadata> {
  const config = await getServerConfig();
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

export default async function Page({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const config = await getServerConfig();
  const customHead = config.seo?.customHead || "";
  const initialTracking = extractTracking(searchParams);

  return (
    <>
      <CustomHead html={customHead} />
      <LandingClient initialConfig={config} initialTracking={initialTracking} />
    </>
  );
}
