"use client";

import { useEffect, useState, useCallback } from "react";
import { LandingConfig, Product, ServiceItem } from "@/lib/types";
import { defaultConfig } from "@/lib/defaultConfig";
import { GRADIENT_PRESETS } from "@/lib/gradients";

const HEADER_BG_PRESETS = ["#1a1a1a", "#0f172a", "#1e3a5f", "#2d1b4e", "#1a3c34", "#4a1a1a"];
const BADGE_COLOR_PRESETS = ["#e63030", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];
const SERVICE_BADGE_PRESETS = [
  "#dcfce7", "#dbeafe", "#fef3c7", "#fce7f3",
  "#e0e7ff", "#f3e8ff", "#ccfbf1", "#fee2e2",
];

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [config, setConfig] = useState<LandingConfig>(defaultConfig);
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("admin_auth") === "true") {
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetch("/api/config")
        .then((res) => res.json())
        .then((data) => setConfig(data))
        .catch(() => {});
    }
  }, [authenticated]);

  const handleLogin = async () => {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      sessionStorage.setItem("admin_auth", "true");
      sessionStorage.setItem("admin_pw", password);
      setAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("비밀번호가 틀렸습니다.");
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const pw = sessionStorage.getItem("admin_pw") || "";
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": pw,
        },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        showToast("저장 완료!");
      } else {
        showToast("저장 실패. 다시 시도해주세요.");
      }
    } catch {
      showToast("저장 실패. 다시 시도해주세요.");
    }
    setSaving(false);
  };

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    const pw = sessionStorage.getItem("admin_pw") || "";
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "x-admin-password": pw },
      body: formData,
    });
    const data = await res.json();
    return data.url || "";
  }, []);

  const updateConfig = (path: string, value: unknown) => {
    setConfig((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {};
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  // Auth modal
  if (!authenticated) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-[340px] shadow-2xl">
          <h2 className="text-lg font-bold text-gray-900 mb-4">관리자 인증</h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="비밀번호 입력"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {authError && <p className="text-red-500 text-xs mt-2">{authError}</p>}
          <button
            onClick={handleLogin}
            className="w-full mt-3 bg-blue-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-blue-700 transition"
          >
            로그인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm shadow-lg z-50 animate-pulse">
          {toast}
        </div>
      )}

      <div className="mx-auto max-w-[600px] p-4 pb-24">
        <h1 className="text-xl font-bold text-gray-900 mb-6">랜딩페이지 관리</h1>

        {/* Brand Section */}
        <Section title="브랜드">
          <ImageUploader
            label="로고 이미지"
            value={config.brand.logo}
            onChange={(url) => updateConfig("brand.logo", url)}
            onUpload={uploadImage}
          />
          <TextInput
            label="브랜드명"
            value={config.brand.name}
            onChange={(v) => updateConfig("brand.name", v)}
          />
        </Section>

        {/* Header Section */}
        <Section title="헤더">
          <TextInput
            label="메인 타이틀"
            value={config.header.title}
            onChange={(v) => updateConfig("header.title", v)}
          />
          <TextInput
            label="뱃지 텍스트 1"
            value={config.header.badgeText1}
            onChange={(v) => updateConfig("header.badgeText1", v)}
          />
          <TextInput
            label="뱃지 텍스트 2"
            value={config.header.badgeText2}
            onChange={(v) => updateConfig("header.badgeText2", v)}
          />
          <TextInput
            label="EVENT 라벨"
            value={config.event.label}
            onChange={(v) => updateConfig("event.label", v)}
          />
          <TextInput
            label="이벤트 기한"
            value={config.event.deadline}
            onChange={(v) => updateConfig("event.deadline", v)}
          />
          <TextInput
            label="서비스 섹션 라벨"
            value={config.services.label}
            onChange={(v) => updateConfig("services.label", v)}
          />
          <ColorPicker
            label="헤더 배경색"
            value={config.header.bgColor}
            presets={HEADER_BG_PRESETS}
            onChange={(v) => updateConfig("header.bgColor", v)}
          />
          <ColorPicker
            label="뱃지 박스 배경색"
            value={config.header.badgeBg || config.header.badgeBorderColor}
            presets={BADGE_COLOR_PRESETS}
            onChange={(v) => {
              updateConfig("header.badgeBg", v);
              updateConfig("header.badgeBorderColor", v);
            }}
          />
          <ColorPicker
            label="뱃지 텍스트1 색상 (국내최초·국내유일)"
            value={config.header.badgeTextColor1 || "#e63030"}
            presets={["#e63030", "#ffffff", "#f59e0b", "#10b981", "#3b82f6", "#ec4899"]}
            onChange={(v) => updateConfig("header.badgeTextColor1", v)}
          />
          <ColorPicker
            label="뱃지 텍스트2 색상 (타격감 특허...)"
            value={config.header.badgeTextColor2 || "#ffffff"}
            presets={["#ffffff", "#000000", "#e63030", "#fef3c7", "#d1d5db", "#a5b4fc"]}
            onChange={(v) => updateConfig("header.badgeTextColor2", v)}
          />
          <ColorPicker
            label="EVENT 라벨 배경색"
            value={config.event.labelBg || "#dc2626"}
            presets={["#dc2626", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"]}
            onChange={(v) => updateConfig("event.labelBg", v)}
          />
          <ColorPicker
            label="EVENT 라벨 글자색"
            value={config.event.labelColor || "#ffffff"}
            presets={["#ffffff", "#000000", "#1a1a1a", "#fef3c7", "#ecfdf5", "#eff6ff"]}
            onChange={(v) => updateConfig("event.labelColor", v)}
          />
          <ColorPicker
            label="기한 박스 배경색"
            value={config.event.deadlineBg || "transparent"}
            presets={["#fee2e2", "#fef3c7", "#dcfce7", "#dbeafe", "#f3e8ff", "#fce7f3"]}
            onChange={(v) => updateConfig("event.deadlineBg", v)}
          />
          <ColorPicker
            label="기한 글자색"
            value={config.event.deadlineColor || "#6b7280"}
            presets={["#991b1b", "#92400e", "#166534", "#1e40af", "#6b21a8", "#9d174d"]}
            onChange={(v) => updateConfig("event.deadlineColor", v)}
          />
        </Section>

        {/* Products Section */}
        <Section title="이벤트 상품">
          {config.event.products.map((product, idx) => (
            <div key={product.id} className="border border-gray-200 rounded-lg p-3 mb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">
                  상품 {idx + 1}
                </span>
                <button
                  onClick={() => {
                    const products = config.event.products.filter((_, i) => i !== idx);
                    updateConfig("event.products", products);
                  }}
                  className="text-red-500 text-xs hover:underline"
                >
                  삭제
                </button>
              </div>
              <ImageUploader
                label="썸네일"
                value={product.thumbnail}
                onChange={(url) => {
                  const products = [...config.event.products];
                  products[idx] = { ...products[idx], thumbnail: url };
                  updateConfig("event.products", products);
                }}
                onUpload={uploadImage}
              />
              <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-end">
                <TextInput
                  label="상품명"
                  value={product.name}
                  onChange={(v) => {
                    const products = [...config.event.products];
                    products[idx] = { ...products[idx], name: v };
                    updateConfig("event.products", products);
                  }}
                />
                <ColorPickerMini
                  value={product.nameColor || "#111827"}
                  onChange={(v) => {
                    const products = [...config.event.products];
                    products[idx] = { ...products[idx], nameColor: v };
                    updateConfig("event.products", products);
                  }}
                />
                <SizeSelect
                  value={product.nameSize || "14px"}
                  onChange={(v) => {
                    const products = [...config.event.products];
                    products[idx] = { ...products[idx], nameSize: v };
                    updateConfig("event.products", products);
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={product.showBadge !== false}
                    onChange={(e) => {
                      const products = [...config.event.products];
                      products[idx] = { ...products[idx], showBadge: e.target.checked };
                      updateConfig("event.products", products);
                    }}
                    className="rounded"
                  />
                  뱃지 표시
                </label>
                {product.showBadge !== false && (
                  <input
                    type="text"
                    value={product.badge}
                    onChange={(e) => {
                      const products = [...config.event.products];
                      products[idx] = { ...products[idx], badge: e.target.value };
                      updateConfig("event.products", products);
                    }}
                    placeholder="BEST"
                    className="border border-gray-200 rounded px-2 py-1 text-xs w-20"
                  />
                )}
              </div>
              <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-end">
                <TextInput
                  label="할인 문구"
                  value={product.discount}
                  onChange={(v) => {
                    const products = [...config.event.products];
                    products[idx] = { ...products[idx], discount: v };
                    updateConfig("event.products", products);
                  }}
                />
                <ColorPickerMini
                  value={product.discountColor || "#ef4444"}
                  onChange={(v) => {
                    const products = [...config.event.products];
                    products[idx] = { ...products[idx], discountColor: v };
                    updateConfig("event.products", products);
                  }}
                />
                <SizeSelect
                  value={product.discountSize || "12px"}
                  onChange={(v) => {
                    const products = [...config.event.products];
                    products[idx] = { ...products[idx], discountSize: v };
                    updateConfig("event.products", products);
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid grid-cols-[1fr_auto_auto] gap-1 items-end">
                  <TextInput
                    label="원가"
                    value={product.originalPrice}
                    onChange={(v) => {
                      const products = [...config.event.products];
                      products[idx] = { ...products[idx], originalPrice: v };
                      updateConfig("event.products", products);
                    }}
                  />
                  <ColorPickerMini
                    value={product.originalPriceColor || "#9ca3af"}
                    onChange={(v) => {
                      const products = [...config.event.products];
                      products[idx] = { ...products[idx], originalPriceColor: v };
                      updateConfig("event.products", products);
                    }}
                  />
                  <SizeSelect
                    value={product.originalPriceSize || "12px"}
                    onChange={(v) => {
                      const products = [...config.event.products];
                      products[idx] = { ...products[idx], originalPriceSize: v };
                      updateConfig("event.products", products);
                    }}
                  />
                </div>
                <div className="grid grid-cols-[1fr_auto_auto] gap-1 items-end">
                  <TextInput
                    label="할인가"
                    value={product.salePrice}
                    onChange={(v) => {
                      const products = [...config.event.products];
                      products[idx] = { ...products[idx], salePrice: v };
                      updateConfig("event.products", products);
                    }}
                  />
                  <ColorPickerMini
                    value={product.salePriceColor || "#111827"}
                    onChange={(v) => {
                      const products = [...config.event.products];
                      products[idx] = { ...products[idx], salePriceColor: v };
                      updateConfig("event.products", products);
                    }}
                  />
                  <SizeSelect
                    value={product.salePriceSize || "14px"}
                    onChange={(v) => {
                      const products = [...config.event.products];
                      products[idx] = { ...products[idx], salePriceSize: v };
                      updateConfig("event.products", products);
                    }}
                  />
                </div>
              </div>
              <TextInput
                label="링크 URL"
                value={product.link}
                onChange={(v) => {
                  const products = [...config.event.products];
                  products[idx] = { ...products[idx], link: v };
                  updateConfig("event.products", products);
                }}
              />
              <div className="flex items-center gap-3 mt-2">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={product.featured}
                    onChange={(e) => {
                      const products = [...config.event.products];
                      products[idx] = { ...products[idx], featured: e.target.checked };
                      updateConfig("event.products", products);
                    }}
                    className="rounded"
                  />
                  그라데이션 강조
                </label>
              </div>
              {product.featured && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">테두리 색상</p>
                  <div className="flex gap-2 flex-wrap">
                    {GRADIENT_PRESETS.map((g, gi) => (
                      <button
                        key={gi}
                        onClick={() => {
                          const products = [...config.event.products];
                          products[idx] = { ...products[idx], gradientIndex: gi };
                          updateConfig("event.products", products);
                        }}
                        className="w-8 h-8 rounded-lg border-2 transition"
                        style={{
                          background: g,
                          borderColor: product.gradientIndex === gi ? "#000" : "transparent",
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          <button
            onClick={() => {
              const newProduct: Product = {
                id: Date.now(),
                name: "",
                nameColor: "#111827",
                nameSize: "14px",
                badge: "",
                showBadge: true,
                thumbnail: "",
                discount: "",
                discountColor: "#ef4444",
                discountSize: "12px",
                originalPrice: "",
                originalPriceColor: "#9ca3af",
                originalPriceSize: "12px",
                salePrice: "",
                salePriceColor: "#111827",
                salePriceSize: "14px",
                link: "",
                featured: false,
                gradientIndex: 0,
              };
              updateConfig("event.products", [...config.event.products, newProduct]);
            }}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg py-2 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition"
          >
            + 상품 추가
          </button>
        </Section>

        {/* Services Section */}
        <Section title="서비스 항목">
          {config.services.items.map((item, idx) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-3 mb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">
                  항목 {idx + 1}
                </span>
                <button
                  onClick={() => {
                    const items = config.services.items.filter((_, i) => i !== idx);
                    updateConfig("services.items", items);
                  }}
                  className="text-red-500 text-xs hover:underline"
                >
                  삭제
                </button>
              </div>
              <ImageUploader
                label="아이콘"
                value={item.icon}
                onChange={(url) => {
                  const items = [...config.services.items];
                  items[idx] = { ...items[idx], icon: url };
                  updateConfig("services.items", items);
                }}
                onUpload={uploadImage}
              />
              <TextInput
                label="항목명"
                value={item.name}
                onChange={(v) => {
                  const items = [...config.services.items];
                  items[idx] = { ...items[idx], name: v };
                  updateConfig("services.items", items);
                }}
              />
              <TextInput
                label="뱃지 텍스트"
                value={item.badge}
                onChange={(v) => {
                  const items = [...config.services.items];
                  items[idx] = { ...items[idx], badge: v };
                  updateConfig("services.items", items);
                }}
              />
              <TextInput
                label="설명"
                value={item.description}
                onChange={(v) => {
                  const items = [...config.services.items];
                  items[idx] = { ...items[idx], description: v };
                  updateConfig("services.items", items);
                }}
              />
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">뱃지 배경색</p>
                <div className="flex gap-2 flex-wrap">
                  {SERVICE_BADGE_PRESETS.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        const items = [...config.services.items];
                        items[idx] = { ...items[idx], badgeBg: color };
                        updateConfig("services.items", items);
                      }}
                      className="w-7 h-7 rounded-full border-2 transition"
                      style={{
                        backgroundColor: color,
                        borderColor: item.badgeBg === color ? "#000" : "transparent",
                      }}
                    />
                  ))}
                  <input
                    type="color"
                    value={item.badgeBg}
                    onChange={(e) => {
                      const items = [...config.services.items];
                      items[idx] = { ...items[idx], badgeBg: e.target.value };
                      updateConfig("services.items", items);
                    }}
                    className="w-7 h-7 rounded-full cursor-pointer"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={() => {
              const newItem: ServiceItem = {
                id: Date.now(),
                icon: "",
                name: "",
                badge: "",
                badgeBg: "#dcfce7",
                badgeColor: "#15803d",
                description: "",
              };
              updateConfig("services.items", [...config.services.items, newItem]);
            }}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg py-2 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition"
          >
            + 항목 추가
          </button>
        </Section>

        {/* Footer Section */}
        <Section title="푸터">
          <TextInput
            label="수상 문구"
            value={config.footer.awards}
            onChange={(v) => updateConfig("footer.awards", v)}
          />
          <TextInput
            label="카피라이트"
            value={config.footer.copyright}
            onChange={(v) => updateConfig("footer.copyright", v)}
          />
          <TextInput
            label="주의사항"
            value={config.footer.disclaimer}
            onChange={(v) => updateConfig("footer.disclaimer", v)}
            multiline
          />
        </Section>

        {/* SEO Section */}
        <Section title="SEO / 메타태그">
          <TextInput
            label="페이지 타이틀 (title)"
            value={config.seo?.title || ""}
            onChange={(v) => updateConfig("seo.title", v)}
          />
          <TextInput
            label="메타 디스크립션 (description)"
            value={config.seo?.description || ""}
            onChange={(v) => updateConfig("seo.description", v)}
            multiline
          />
          <TextInput
            label="OG 타이틀 (og:title)"
            value={config.seo?.ogTitle || ""}
            onChange={(v) => updateConfig("seo.ogTitle", v)}
          />
          <TextInput
            label="OG 디스크립션 (og:description)"
            value={config.seo?.ogDescription || ""}
            onChange={(v) => updateConfig("seo.ogDescription", v)}
            multiline
          />
          <ImageUploader
            label="OG 이미지 (og:image)"
            value={config.seo?.ogImage || ""}
            onChange={(url) => updateConfig("seo.ogImage", url)}
            onUpload={uploadImage}
          />
          <TextInput
            label="OG URL (og:url)"
            value={config.seo?.ogUrl || ""}
            onChange={(v) => updateConfig("seo.ogUrl", v)}
          />
          <p className="text-[10px] text-gray-400">
            * robots: noindex, nofollow 는 항상 고정 적용됩니다.
          </p>
        </Section>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-40">
        <div className="mx-auto max-w-[600px]">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 text-white rounded-lg py-3 text-sm font-bold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saving ? "저장 중..." : "저장하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ========== Reusable Components ==========

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
      <h2 className="text-sm font-bold text-gray-800 mb-3 pb-2 border-b">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}
    </div>
  );
}

function ColorPicker({
  label,
  value,
  presets,
  onChange,
}: {
  label: string;
  value: string;
  presets: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      <div className="flex gap-2 items-center flex-wrap">
        {presets.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className="w-7 h-7 rounded-full border-2 transition"
            style={{
              backgroundColor: color,
              borderColor: value === color ? "#000" : "transparent",
            }}
          />
        ))}
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-7 h-7 rounded-full cursor-pointer"
        />
      </div>
    </div>
  );
}

function ColorPickerMini({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-8 h-8 rounded cursor-pointer border border-gray-200 mb-0.5"
      title="색상"
    />
  );
}

function SizeSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-200 rounded px-1 py-1 text-xs h-8 mb-0.5"
      title="크기"
    >
      <option value="10px">10</option>
      <option value="11px">11</option>
      <option value="12px">12</option>
      <option value="13px">13</option>
      <option value="14px">14</option>
      <option value="15px">15</option>
      <option value="16px">16</option>
      <option value="18px">18</option>
      <option value="20px">20</option>
    </select>
  );
}

function ImageUploader({
  label,
  value,
  onChange,
  onUpload,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  onUpload: (file: File) => Promise<string>;
}) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await onUpload(file);
      if (url) onChange(url);
    } catch {
      // upload failed silently
    }
    setUploading(false);
  };

  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      <div className="flex items-center gap-2">
        {value && (
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs px-3 py-2 rounded-lg transition">
          {uploading ? "업로드 중..." : "파일 선택"}
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
            disabled={uploading}
          />
        </label>
        {value && (
          <button
            onClick={() => onChange("")}
            className="text-red-400 text-xs hover:underline"
          >
            삭제
          </button>
        )}
      </div>
    </div>
  );
}
