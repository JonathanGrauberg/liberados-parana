import { Benefits } from "@/components/site/Benefits";
import { Brands } from "@/components/site/Brands";
import { Catalog } from "@/components/site/Catalog";
import { Categories } from "@/components/site/Categories";
import { Deals } from "@/components/site/Deals";
import { Featured } from "@/components/site/Featured";
import { Footer, WhatsAppFab } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { Nav } from "@/components/site/Nav";
import { ProductModal } from "@/components/site/ProductModal";
import { TextReveal } from "@/components/site/Reveal";
import { SiteProvider } from "@/components/site/SiteContext";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { Spotlight } from "@/components/site/Spotlight";
import { TradeIn } from "@/components/site/TradeIn";
import { Visit } from "@/components/site/Visit";
import { WelcomePopup } from "@/components/site/WelcomePopup";
import { getPublicData } from "@/lib/db";

// Los datos cambian cuando el local carga productos: se lee en cada visita.
export const dynamic = "force-dynamic";

export default async function Home() {
  const { products, settings } = await getPublicData();
  return (
    <SiteProvider products={products} settings={settings}>
      <SmoothScroll />
      <Nav />
      <main>
        <Hero />
        <Categories />
        <Deals />
        <Catalog />
        <Benefits />
        <Brands />
        <Spotlight />
        <Featured />
        <TextReveal
          text="Equipos nuevos, sellados y usados premium. Todos liberados, revisados y con garantía. Y tu usado, como parte de pago."
          highlight={["liberados", "garantía", "usado"]}
        />
        <TradeIn />
        <Visit />
      </main>
      <Footer />
      <WhatsAppFab />
      <ProductModal />
      <WelcomePopup />
    </SiteProvider>
  );
}
