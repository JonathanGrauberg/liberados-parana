import { HoursEditor } from "@/components/admin/HoursEditor";
import { PageTitle } from "@/components/admin/ui";
import { readDB } from "@/lib/db";

export default async function Hours() {
  const { settings } = await readDB();
  return (
    <>
      <PageTitle title="Horarios" subtitle="Se muestran en la web con el cartel de “Abierto ahora”." />
      <HoursEditor hours={settings.hours} note={settings.hoursNote} />
    </>
  );
}
