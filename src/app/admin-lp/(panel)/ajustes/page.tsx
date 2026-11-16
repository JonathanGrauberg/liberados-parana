import { PasswordCard } from "@/components/admin/PasswordCard";
import { SettingsEditor } from "@/components/admin/SettingsEditor";
import { PageTitle } from "@/components/admin/ui";
import { readDB } from "@/lib/db";

export default async function SettingsPage() {
  const { settings } = await readDB();
  return (
    <>
      <PageTitle title="Ajustes" subtitle="Valores del plan canje, datos de contacto y contraseña del panel." />
      <SettingsEditor settings={settings} />
      <div className="mt-6"><PasswordCard /></div>
    </>
  );
}
