"use client";

import { useEffect } from "react";

export default function CustomHead({ html }: { html: string }) {
  useEffect(() => {
    if (!html) return;

    const container = document.createElement("div");
    container.innerHTML = html;

    const addedElements: Node[] = [];

    // Process all child elements and add to <head>
    Array.from(container.children).forEach((el) => {
      const tagName = el.tagName.toLowerCase();

      if (tagName === "script") {
        // Create a new script element to ensure execution
        const script = document.createElement("script");
        Array.from(el.attributes).forEach((attr) => {
          script.setAttribute(attr.name, attr.value);
        });
        if (el.textContent) {
          script.textContent = el.textContent;
        }
        document.head.appendChild(script);
        addedElements.push(script);
      } else {
        // meta, link, style, noscript, etc.
        const clone = el.cloneNode(true);
        document.head.appendChild(clone);
        addedElements.push(clone);
      }
    });

    // Cleanup on unmount
    return () => {
      addedElements.forEach((el) => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
    };
  }, [html]);

  // Also render noscript content server-side for crawlers
  if (!html) return null;

  // Extract non-script tags for SSR (meta, link tags that crawlers need)
  const nonScriptHtml = html.replace(/<script[\s\S]*?<\/script>/gi, "").trim();
  if (!nonScriptHtml) return null;

  return (
    <div
      dangerouslySetInnerHTML={{ __html: nonScriptHtml }}
      style={{ display: "none" }}
      suppressHydrationWarning
    />
  );
}
