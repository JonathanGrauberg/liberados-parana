# Liberados Paraná — web + panel del local

Next.js 16 · React 19 · TypeScript · Tailwind 4 · Motion · Lenis · IA de recorte (@imgly/background-removal)

## Arrancar

```bash
npm install
cp .env.example .env.local   # cambiar la contraseña del panel
npm run dev -- --port 3210
```

- Web: http://localhost:3210
- Panel: http://localhost:3210/admin-lp (contraseña en `.env.local`). No está enlazado desde la web ni se indexa.

## Qué hay

**Web pública** (`src/components/site`)
- Hero con los destacados turnándose sobre un pedestal y la foto del cartel con parallax de fondo.
- Categorías, oferta de la semana con cuenta regresiva, catálogo con buscador y filtros; ficha con características y flechas (se cargan en el panel).
- Producto estrella, destacados en galería horizontal, texto que se ilumina al scrollear.
- Cotizador de Plan Canje (3 preguntas → valor estimado y diferencia a pagar → WhatsApp).
- Precios en dólares (efectivo y lista) con el equivalente en pesos según la cotización que carga el local; "Consultá precio" para los que no se publican.
- Fondo fijo con el degradé del logo (índigo → violeta → rosa). Se cambia en `--page-gradient` y `.site-bg` de `globals.css`.
- Plan Canje: el cliente nunca ve cuánto le toman el equipo; solo ve "Para llevarte el X pagás: U$S …" con el número contando. Valores máximos por modelo y porcentajes en Panel › Ajustes.
- Cartel de bienvenida editable, horarios con "Abierto ahora" (hora de Argentina) y mapa de Google Maps del local.

**Panel** (`src/app/admin-lp`) — pensado para usarlo desde el celular
- Productos: precio en dólares o pesos (efectivo, lista, a consultar), proveedor interno, fotos desde la cámara, **quitar fondo con IA en el propio navegador**, color de brillo automático, stock con +/−, visible/destacado.
- Ventas y stock: registrar venta (descuenta stock, admite equipo en canje), ingresos de mercadería, totales por día/semana/mes, ganancia según costo, historial de movimientos.
- Ofertas: cartel de bienvenida editable (claro/oscuro, textos con límite, se muestra una vez por visitante y otra vez cuando se cambia; `/?cartel=1` lo fuerza) y oferta de la semana.
- Ajustes: cotización del dólar, valores del plan canje (U$S) y contacto. Las ventas se totalizan en pesos con la cotización del día.
- Horarios y aviso especial.

## Branding (cuando llegue el manual del diseñador)

- Colores: `src/app/globals.css` (bloque *TOKENS DE MARCA*) y `src/brand.config.ts`.
- Tipografía: `src/app/fonts.ts` (Google Font o archivo propio con `next/font/local`).
- Logo: `src/components/site/Logo.tsx` (hoy es una recreación en SVG del cartel).

## Datos

PostgreSQL en **Neon**, con **Prisma 7** (`prisma/schema.prisma`, cliente generado en `src/generated/prisma`).
Productos, ventas, movimientos de stock, ajustes y **fotos** (tabla `Media`, servidas en `/media/[id]`) viven en la base, así que funciona igual en la compu y en Vercel.

- La primera vez que arranca con la base vacía, carga sola los datos iniciales de `src/lib/seed.ts`.
- Cambiar el esquema: editar `prisma/schema.prisma` y correr `npm run db:migrate`.
- Ver/editar datos a mano: `npm run db:studio`.

## Publicar en Vercel

1. Importar el repo de GitHub en Vercel.
2. En *Settings › Environment Variables* cargar `DATABASE_URL`, `ADMIN_PASSWORD` y `SESSION_SECRET` (ver `.env.example`). **Sin las dos últimas el panel no deja entrar.**
3. Deploy. El build aplica las migraciones pendientes (`prisma migrate deploy`) y genera el cliente.
