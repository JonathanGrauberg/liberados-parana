import type { Metadata, Viewport } from "next";
import { display, text } from "./fonts";
import { brand } from "@/brand.config";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${brand.name} · ${brand.tagline}`,
    template: `%s · ${brand.name}`,
  },
  description: brand.description,
};

export const viewport: Viewport = {
  themeColor: brand.colors.ink,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR" className={`${display.variable} ${text.variable} antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
