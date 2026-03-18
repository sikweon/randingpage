"use client";

import { useEffect, useState } from "react";
import { LandingConfig, Product, ServiceItem } from "@/lib/types";
import { defaultConfig } from "@/lib/defaultConfig";
import { GRADIENT_PRESETS } from "@/lib/gradients";

export default function LandingPage() {
  const [config, setConfig] = useState<LandingConfig>(defaultConfig);

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch(() => setConfig(defaultConfig));
  }, []);

  const { brand, header, event, services, footer, seo } = config;

  useEffect(() => {
    if (seo?.title) document.title = seo.title;

    const setMeta = (name: string, content: string, property?: boolean) => {
      if (!content) return;
      const attr = property ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMeta("description", seo?.description || "");
    setMeta("robots", "noindex, nofollow");
    setMeta("og:title", seo?.ogTitle || seo?.title || "", true);
    setMeta("og:description", seo?.ogDescription || seo?.description || "", true);
    setMeta("og:image", seo?.ogImage || "", true);
    setMeta("og:url", seo?.ogUrl || "", true);
    setMeta("og:type", "website", true);
  }, [seo]);

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="mx-auto max-w-[480px]">
        {/* Header Section */}
        <div
          className="px-5 pt-8 pb-6"
          style={{ backgroundColor: header.bgColor }}
        >
          {/* Brand */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
              {brand.logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
            </div>
            <span className="text-white text-sm font-medium">{brand.name}</span>
          </div>

          {/* Title */}
          <h1 className="text-white text-[22px] font-bold leading-tight mb-4 text-center">
            {header.title}
          </h1>

          {/* Badge Box */}
          <div className="flex justify-center">
          <div
            className="rounded-lg px-4 py-3 text-center inline-block"
            style={{
              backgroundColor: header.badgeBg || header.badgeBorderColor,
            }}
          >
            <p
              className="text-sm font-bold"
              style={{ color: header.badgeTextColor1 }}
            >
              {header.badgeText1}
            </p>
            <p
              className="text-sm font-medium mt-0.5"
              style={{ color: header.badgeTextColor2 }}
            >
              {header.badgeText2}
            </p>
          </div>
          </div>
        </div>

        {/* Event Section */}
        <div className="px-4 py-5">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded"
              style={{ backgroundColor: event.labelBg || "#dc2626", color: event.labelColor || "#ffffff" }}
            >
              {event.label}
            </span>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded"
              style={{ backgroundColor: event.deadlineBg || "transparent", color: event.deadlineColor || "#6b7280" }}
            >
              {event.deadline}
            </span>
          </div>

          <div className="mt-3 space-y-3">
            {event.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Services Section */}
        <div className="px-4 py-5">
          <h2 className="text-base font-bold text-gray-800 mb-3">
            {services.label}
          </h2>
          <div className="space-y-3">
            {services.items.map((item) => (
              <ServiceCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-6 text-center">
          <div className="text-yellow-500 text-lg mb-1">★★★★★</div>
          <p className="text-sm font-semibold text-gray-700">{footer.awards}</p>
          <p className="text-xs text-gray-400 mt-2">{footer.copyright}</p>
          <p className="text-[10px] text-gray-400 mt-3 leading-relaxed px-2">
            {footer.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const inner = (
    <div className="bg-white rounded-lg p-3 flex items-center gap-3">
      {/* Thumbnail */}
      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
        {product.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.thumbnail}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              el.style.display = "none";
              el.parentElement!.classList.add(
                "bg-gradient-to-br",
                "from-gray-200",
                "to-gray-300"
              );
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span
            className="font-bold truncate"
            style={{ color: product.nameColor || "#111827", fontSize: product.nameSize || "14px" }}
          >
            {product.name}
          </span>
          {product.showBadge !== false && product.badge && (
            <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0">
              {product.badge}
            </span>
          )}
        </div>
        <p
          className="font-semibold"
          style={{ color: product.discountColor || "#ef4444", fontSize: product.discountSize || "12px" }}
        >
          {product.discount}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="line-through"
            style={{ color: product.originalPriceColor || "#9ca3af", fontSize: product.originalPriceSize || "12px" }}
          >
            {product.originalPrice}
          </span>
          <span
            className="font-bold"
            style={{ color: product.salePriceColor || "#111827", fontSize: product.salePriceSize || "14px" }}
          >
            {product.salePrice}
          </span>
        </div>
      </div>

      {/* Arrow */}
      <div className="text-gray-300 flex-shrink-0">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );

  const cardContent = product.featured ? (
    <div
      className="featured-card"
      style={{
        background: GRADIENT_PRESETS[product.gradientIndex] || GRADIENT_PRESETS[0],
        backgroundSize: "300% 300%",
      }}
    >
      {inner}
    </div>
  ) : (
    <div className="rounded-lg border border-gray-200">{inner}</div>
  );

  return (
    <a
      href={product.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      {cardContent}
    </a>
  );
}

function ServiceCard({ item }: { item: ServiceItem }) {
  return (
    <div className="bg-white rounded-lg p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center bg-gray-100 text-xl">
        {item.icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.icon}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              el.style.display = "none";
              el.parentElement!.textContent = "📋";
            }}
          />
        ) : (
          "📋"
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-sm text-gray-900">{item.name}</span>
          {item.badge && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: item.badgeBg,
                color: item.badgeColor,
              }}
            >
              {item.badge}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500">{item.description}</p>
      </div>
    </div>
  );
}
