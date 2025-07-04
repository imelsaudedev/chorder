import { useDeleteService } from "@/app/api/api-client";
import ActionMenu from "@/components/common/ActionMenu";
import { ClientService } from "@/prisma/models";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

interface ServiceActionMenuProps {
  service: ClientService;
}

export default function ServiceActionMenu({ service }: ServiceActionMenuProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const editUrl = `${pathname}/edit`;
  const { deleteService, isMutating } = useDeleteService(service.id!);

  return (
    <ActionMenu
      editUrl={editUrl}
      isDeleting={isMutating}
      onDelete={deleteService}
      confirmDeleteTitle={t("ServiceForm.confirmDeleteTitle")}
      confirmDeleteDescription={t("ServiceForm.confirmDelete")}
    />
  );
}
