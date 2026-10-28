import { Benefits } from "@/components/site/Benefits";
import { CanjeDrawer, CanjeTrigger } from "@/components/site/CanjeDrawer";
import { Catalog } from "@/components/site/Catalog";
import { Financiaciones } from "@/components/site/Financiaciones";
import { Footer, WhatsAppFab } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { Nav } from "@/components/site/Nav";
import { PlanCanje } from "@/components/site/PlanCanje";
import { ProductModal } from "@/components/site/ProductModal";
import { Reviews } from "@/components/site/Reviews";
import { SiteProvider } from "@/components/site/SiteContext";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { Visit } from "@/components/site/Visit";
import { WelcomePopup } from "@/components/site/WelcomePopup";
import { getPublicData } from "@/lib/db";
import { getGoogleReviews } from "@/lib/reviews";

// Los datos cambian cuando el local carga productos: se lee en cada visita.
export const dynamic = "force-dynamic";

/** Encabezado corto → catálogo de iPhone → beneficios → ubicación → Plan Canje → reseñas de Google. Financiaciones entre el encabezado y el catálogo. Además, el Plan Canje flotante. */
export default async function Home() {
  const { products, settings } = await getPublicData();
  const reviews = await getGoogleReviews(`Liberados Paraná ${settings.contact.address} Paraná Entre Ríos`);
  return (
    <SiteProvider products={products} settings={settings}>
      <div className="site-bg" aria-hidden />
      <SmoothScroll />
      <Nav />
      <main>
        <Hero />
        <Financiaciones />
        <Catalog />
        <Benefits />
        <Visit />
        <PlanCanje />
        <Reviews data={reviews} />
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
