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
- Cartel de bienvenida editable, horarios con "Abierto ahora" (hora de Argentina) y mapa 3D de Argentina que vuela hasta Paraná.

**Panel** (`src/app/admin-lp`) — pensado para usarlo desde el celular
- Productos: fotos desde la cámara, **quitar fondo con IA en el propio navegador**, color de brillo automático, stock con +/−, visible/destacado.
- Ventas y stock: registrar venta (descuenta stock, admite equipo en canje), ingresos de mercadería, totales por día/semana/mes, ganancia según costo, historial de movimientos.
- Ofertas: cartel de bienvenida editable (claro/oscuro, textos con límite, se muestra una vez por visitante y otra vez cuando se cambia; `/?cartel=1` lo fuerza) y oferta de la semana.
- Horarios, aviso especial, valores del plan canje y datos de contacto.

## Branding (cuando llegue el manual del diseñador)

- Colores: `src/app/globals.css` (bloque *TOKENS DE MARCA*) y `src/brand.config.ts`.
- Tipografía: `src/app/fonts.ts` (Google Font o archivo propio con `next/font/local`).
- Logo: `src/components/site/Logo.tsx` (hoy es una recreación en SVG del cartel).

## Datos

Se guardan en `data/db.json` y las fotos en `data/uploads/` (no se versionan; si se borra `db.json`, vuelve a los datos de ejemplo de `src/lib/seed.ts`).
Sirve para un servidor propio/VPS. Para hosting serverless (Vercel) hay que pasar `src/lib/db.ts` y `/api/upload` a una base y almacenamiento externos (ej. Supabase); el resto del código no cambia.
