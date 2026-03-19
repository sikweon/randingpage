import "./globals.css";

export const dynamic = "force-dynamic";

async function getCustomHead(): Promise<string> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return "";

    const res = await fetch(
      `${url}/rest/v1/landing_config?key=eq.main&select=value`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        cache: "no-store",
      }
    );

    if (!res.ok) return "";
    const data = await res.json();
    return data?.[0]?.value?.seo?.customHead || "";
  } catch {
    return "";
  }
}

function parseMetaTags(html: string): Array<{ name?: string; property?: string; content: string; httpEquiv?: string }> {
  const tags: Array<{ name?: string; property?: string; content: string; httpEquiv?: string }> = [];
  const metaRegex = /<meta\s+([^>]*)\/?>/gi;
  let match;
  while ((match = metaRegex.exec(html)) !== null) {
    const attrs = match[1];
    const nameMatch = attrs.match(/name=["']([^"']+)["']/i);
    const propertyMatch = attrs.match(/property=["']([^"']+)["']/i);
    const contentMatch = attrs.match(/content=["']([^"']+)["']/i);
    const httpEquivMatch = attrs.match(/http-equiv=["']([^"']+)["']/i);
    if (contentMatch) {
      tags.push({
        name: nameMatch?.[1],
        property: propertyMatch?.[1],
        content: contentMatch[1],
        httpEquiv: httpEquivMatch?.[1],
      });
    }
  }
  return tags;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const customHead = await getCustomHead();
  const customMetaTags = customHead ? parseMetaTags(customHead) : [];

  // Check if there are script tags
  const scriptMatches = customHead ? customHead.match(/<script[\s\S]*?<\/script>/gi) || [] : [];

  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
        {/* Custom meta tags from admin */}
        {customMetaTags.map((tag, i) => (
          <meta
            key={`custom-meta-${i}`}
            {...(tag.name ? { name: tag.name } : {})}
            {...(tag.property ? { property: tag.property } : {})}
            {...(tag.httpEquiv ? { httpEquiv: tag.httpEquiv } : {})}
            content={tag.content}
          />
        ))}
        {/* Custom script tags */}
        {scriptMatches.map((scriptHtml, i) => {
          const srcMatch = scriptHtml.match(/src=["']([^"']+)["']/);
          const innerContent = scriptHtml.replace(/<script[^>]*>|<\/script>/gi, "").trim();
          const asyncAttr = /\basync\b/i.test(scriptHtml);

          if (srcMatch) {
            return (
              <script key={`custom-script-${i}`} src={srcMatch[1]} async={asyncAttr} />
            );
          }
          if (innerContent) {
            return (
              <script key={`custom-script-${i}`} dangerouslySetInnerHTML={{ __html: innerContent }} />
            );
          }
          return null;
        })}
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
