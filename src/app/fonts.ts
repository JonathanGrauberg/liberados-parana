/**
 * TIPOGRAFÍA — para cambiarla:
 *  - Google Font: reemplazar `Montserrat` por la que corresponda.
 *  - Fuente propia del diseñador: usar `next/font/local`, ej:
 *      import localFont from "next/font/local";
 *      export const display = localFont({ src: "./fonts/Marca-Bold.woff2", variable: "--font-display" });
 * Las variables --font-display / --font-text las consume globals.css.
 */
import { Montserrat, Inter } from "next/font/google";

export const display = Montserrat({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
});

export const text = Inter({
  variable: "--font-text",
  subsets: ["latin"],
});
