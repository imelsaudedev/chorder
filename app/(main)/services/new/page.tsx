import ClientServiceFormPage from "../ClientServiceFormPage";

export default async function NewServicePage({
  searchParams,
}: {
  searchParams: Promise<{ title?: string; worshipLeader?: string; date?: string }>;
}) {
  const { title, worshipLeader, date } = await searchParams;

  return (
    <ClientServiceFormPage
      serviceSlug={null}
      defaultMeta={{
        title: title ?? "",
        worshipLeader: worshipLeader ?? "",
        date: date ? new Date(date) : new Date(),
      }}
    />
  );
}
