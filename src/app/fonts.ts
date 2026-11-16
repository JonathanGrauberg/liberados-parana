/**
 * TIPOGRAFÍA — para cambiarla:
 *  - Google Font: reemplazar `Montserrat` por la que corresponda.
 *  - Fuente propia del diseñador: usar `next/font/local`, ej:
 *      import localFont from "next/font/local";
 *      export const display = localFont({ src: "./fonts/Marca-Bold.woff2", variable: "--font-display" });
 * Las variables --font-display / --font-text las consume globals.css.
 */
import { Montserrat } from "next/font/google";

export const display = Montserrat({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
});

// Textos también en Montserrat, como la web anterior del local
export const text = Montserrat({
  variable: "--font-text",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
