import { useDeleteService } from "@/app/api/api-client";
import ActionMenu from "@/components/common/ActionMenu";
import { ClientService } from "@/prisma/models";
import { useTranslations } from "next-intl";

interface ServiceActionMenuProps {
  service: ClientService;
}

// Só ações destrutivas ficam aqui; editar o roteiro está na barra de ações da liturgia.
export default function ServiceActionMenu({ service }: ServiceActionMenuProps) {
  const t = useTranslations();
  const { deleteService, isMutating } = useDeleteService(service.id!);

  return (
    <ActionMenu
      isDeleting={isMutating}
      isDuplicating={false}
      onDelete={deleteService}
      deleteLabel={t("Messages.deleteService")}
      confirmDeleteTitle={t("ServiceForm.confirmDeleteTitle")}
      confirmDeleteDescription={t("ServiceForm.confirmDelete")}
    />
  );
}
