import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Travel Planner · 出游攻略助手",
  description:
    "开源的出游攻略助手：规划行程、管理出行清单、一键导出 Markdown 攻略。数据保存在本地浏览器。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
