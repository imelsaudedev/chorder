import ClientServiceFormPage from "../ClientServiceFormPage";

export default async function NewServicePage({
  searchParams,
}: {
  searchParams: Promise<{
    title?: string;
    worshipLeader?: string;
    preacher?: string;
    date?: string;
  }>;
}) {
  const { title, worshipLeader, preacher, date } = await searchParams;

  return (
    <ClientServiceFormPage
      serviceSlug={null}
      defaultMeta={{
        title: title ?? "",
        worshipLeader: worshipLeader ?? "",
        preacher: preacher ?? "",
        date: date ? new Date(date) : new Date(),
      }}
    />
  );
}
