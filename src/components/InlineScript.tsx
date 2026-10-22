"use client";

/**
 * Script que corre antes de pintar la página (ver guía "preventing flash" de Next).
 * En el cliente se marca como text/plain para que React no lo vuelva a ejecutar ni avise.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
