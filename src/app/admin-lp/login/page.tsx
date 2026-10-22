import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { LogoMark } from "@/components/site/Logo";
import { isAdmin } from "@/lib/auth";

// Acceso privado: no está enlazado desde la web ni se indexa.
export const metadata: Metadata = { title: "Acceso", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin-lp");
  return (
    <main className="grid min-h-dvh place-items-center bg-ink px-5 font-normal">
      <div className="w-full max-w-sm border border-line p-8 md:p-10">
        <LogoMark className="h-12 w-12" />
        <p className="eyebrow mt-8">Panel del local</p>
        <h1 className="title-lux mt-3 text-3xl">
          Liberados <b>Paraná</b>
        </h1>
        <LoginForm />
      </div>
    </main>
  );
}
