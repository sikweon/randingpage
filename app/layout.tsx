import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "콩즈 라이프스타일 스토어",
  description: "당신의 일상에 특별한 경험을 더합니다",
  robots: "noindex, nofollow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
