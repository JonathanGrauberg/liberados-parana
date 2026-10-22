import type { Metadata, Viewport } from "next";
import { display, text } from "./fonts";
import { brand } from "@/brand.config";
import { InlineScript } from "@/components/InlineScript";
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

// Aplica el modo claro elegido por el visitante antes de pintar (sin parpadeo). El panel siempre queda igual.
const themeScript = `try{if(!location.pathname.startsWith("/admin-lp")&&localStorage.getItem("lp-theme")==="light")document.documentElement.dataset.theme="light"}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR" className={`${display.variable} ${text.variable} antialiased`} suppressHydrationWarning>
      <head>
        <InlineScript html={themeScript} />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
