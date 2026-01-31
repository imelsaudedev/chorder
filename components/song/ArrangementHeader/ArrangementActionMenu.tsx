import { useDeleteArrangement, useDuplicateArrangement } from "#api-client";
import ActionMenu from "@/components/common/ActionMenu";
import { ClientArrangement } from "@/prisma/models";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

interface ArrangementActionMenuProps {
  arrangement: ClientArrangement;
}

export default function ArrangementActionMenu({
  arrangement,
}: ArrangementActionMenuProps) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const editUrl = `${pathname}/edit?arrangement=${arrangement.id}`;
  const { duplicateArrangement, isMutating: isDuplicating, duplicatedArrangement } = useDuplicateArrangement(arrangement.id!);
  const { deleteArrangement, isMutating: isDeleting } = useDeleteArrangement(
    arrangement.id!
  );

  useEffect(() => {
    if (duplicatedArrangement) {
      const newUrl = `${pathname}?arrangement=${duplicatedArrangement.id}`;
      router.replace(newUrl);
    }
  }, [duplicatedArrangement, pathname, router]);

  const handleDuplicate = () => {
    duplicateArrangement();
  };

  return (
    <ActionMenu
      editUrl={editUrl}
      isDuplicating={isDuplicating}
      isDeleting={isDeleting}
      onDuplicate={handleDuplicate}
      onDelete={deleteArrangement}
      confirmDeleteTitle={t("SongForm.confirmDeleteTitle")}
      confirmDeleteDescription={t("SongForm.confirmDelete")}
    />
  );
}
