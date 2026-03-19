"use client";

import { useEffect } from "react";

export default function CustomHead({ html }: { html: string }) {
  useEffect(() => {
    if (!html) return;

    const container = document.createElement("div");
    container.innerHTML = html;

    const addedElements: Node[] = [];

    Array.from(container.children).forEach((el) => {
      const tagName = el.tagName.toLowerCase();

      if (tagName === "script") {
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
        const clone = el.cloneNode(true);
        document.head.appendChild(clone);
        addedElements.push(clone);
      }
    });

    // Handle plain text nodes (comments, etc.)
    const textOnly = html.replace(/<[^>]+>[\s\S]*?<\/[^>]+>/g, "").replace(/<[^>]+\/>/g, "").trim();
    if (textOnly) {
      const comment = document.createComment(textOnly);
      document.head.appendChild(comment);
      addedElements.push(comment);
    }

    return () => {
      addedElements.forEach((el) => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
    };
  }, [html]);

  // No visible DOM output - everything goes to <head> via useEffect
  return null;
}
