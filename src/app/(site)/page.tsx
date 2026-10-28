import { Benefits } from "@/components/site/Benefits";
import { CanjeDrawer, CanjeTrigger } from "@/components/site/CanjeDrawer";
import { Catalog } from "@/components/site/Catalog";
import { Footer, WhatsAppFab } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { Nav } from "@/components/site/Nav";
import { ProductModal } from "@/components/site/ProductModal";
import { SiteProvider } from "@/components/site/SiteContext";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { Visit } from "@/components/site/Visit";
import { WelcomePopup } from "@/components/site/WelcomePopup";
import { getPublicData } from "@/lib/db";

// Los datos cambian cuando el local carga productos: se lee en cada visita.
export const dynamic = "force-dynamic";

/** Encabezado corto → catálogo de iPhone → beneficios → ubicación. El Plan Canje es un panel flotante. */
export default async function Home() {
  const { products, settings } = await getPublicData();
  return (
    <SiteProvider products={products} settings={settings}>
      <SmoothScroll />
      <Nav />
      <main>
        <Hero />
        <Catalog />
        <Benefits />
        <Visit />
      </main>
      <Footer />
      <WhatsAppFab />
      <CanjeTrigger />
      <CanjeDrawer />
      <ProductModal />
      <WelcomePopup />
    </SiteProvider>
  );
}
