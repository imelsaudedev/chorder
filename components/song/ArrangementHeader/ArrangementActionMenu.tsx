import { useDeleteArrangement } from "#api-client";
import ActionMenu from "@/components/common/ActionMenu";
import { ClientArrangement } from "@/prisma/models";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

interface ArrangementActionMenuProps {
  arrangement: ClientArrangement;
}

export default function ArrangementActionMenu({
  arrangement,
}: ArrangementActionMenuProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const editUrl = `${pathname}/edit?arrangement=${arrangement.id}`;
  const { deleteArrangement, isMutating } = useDeleteArrangement(
    arrangement.id!
  );

  return (
    <ActionMenu
      editUrl={editUrl}
      isDeleting={isMutating}
      onDelete={deleteArrangement}
      confirmDeleteTitle={t("SongForm.confirmDeleteTitle")}
      confirmDeleteDescription={t("SongForm.confirmDelete")}
    />
  );
}
