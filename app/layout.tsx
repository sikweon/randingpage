import "./globals.css";
import { getServerConfig } from "@/lib/getServerConfig";

export const dynamic = "force-dynamic";

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
  const config = await getServerConfig();
  const customHead = config.seo?.customHead || "";
  const customMetaTags = customHead ? parseMetaTags(customHead) : [];
  const scriptMatches = customHead ? customHead.match(/<script[\s\S]*?<\/script>/gi) || [] : [];

  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
        {customMetaTags.map((tag, i) => (
          <meta
            key={`custom-meta-${i}`}
            {...(tag.name ? { name: tag.name } : {})}
            {...(tag.property ? { property: tag.property } : {})}
            {...(tag.httpEquiv ? { httpEquiv: tag.httpEquiv } : {})}
            content={tag.content}
          />
        ))}
        {scriptMatches.map((scriptHtml, i) => {
          const srcMatch = scriptHtml.match(/src=["']([^"']+)["']/);
          const innerContent = scriptHtml.replace(/<script[^>]*>|<\/script>/gi, "").trim();
          const asyncAttr = /\basync\b/i.test(scriptHtml);

          if (srcMatch) {
            return <script key={`custom-script-${i}`} src={srcMatch[1]} async={asyncAttr} />;
          }
          if (innerContent) {
            return <script key={`custom-script-${i}`} dangerouslySetInnerHTML={{ __html: innerContent }} />;
          }
          return null;
        })}
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
