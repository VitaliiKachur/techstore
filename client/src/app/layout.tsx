import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TechStore | Інтернет-магазин електроніки",
  description: "Сучасний інтернет-магазин електроніки на Next.js та Node.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
