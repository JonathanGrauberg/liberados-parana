import { SettingsEditor } from "@/components/admin/SettingsEditor";
import { PageTitle } from "@/components/admin/ui";
import { readDB } from "@/lib/db";

export default async function SettingsPage() {
  const { settings } = await readDB();
  return (
    <>
      <PageTitle title="Ajustes" subtitle="Valores del plan canje y datos de contacto." />
      <SettingsEditor settings={settings} />
    </>
  );
}
